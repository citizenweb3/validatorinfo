#!/bin/bash
# tools/run-agent.sh — wraps claude -p with full logging
# Usage: ./tools/run-agent.sh --agent seo-vi --role content --trigger issue \
#        --issue 42 --prompt-file .claude/agents/seo-vi.md \
#        -- "Your task: write an article about Namada staking"

DB="/data/monitoring/monitoring.db"
RUN_ID="${GITHUB_RUN_ID:-manual-$(date +%s)}"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --agent) AGENT="$2"; shift 2 ;;
    --role) ROLE="$2"; shift 2 ;;
    --trigger) TRIGGER="$2"; shift 2 ;;
    --issue) ISSUE_NUM="$2"; shift 2 ;;
    --prompt-file) PROMPT_FILE="$2"; shift 2 ;;
    --) shift; PROMPT="$*"; break ;;
    *) shift ;;
  esac
done

PROMPT_HASH=$(echo -n "$PROMPT" | sha256sum | cut -d' ' -f1)
START_MS=$(date +%s%3N)

# Record start
sqlite3 "$DB" "INSERT INTO agent_runs
  (run_id, agent, role, trigger, issue_number, prompt_file, prompt_hash, started_at)
  VALUES
  ('$RUN_ID', '$AGENT', '$ROLE', '$TRIGGER', ${ISSUE_NUM:-NULL},
   '${PROMPT_FILE:-}', '$PROMPT_HASH', datetime('now'))"

# Log the prompt
sqlite3 "$DB" "INSERT INTO agent_logs (run_id, log_type, content)
  VALUES ('$RUN_ID', 'prompt', '$(echo "$PROMPT" | sed "s/'/''/g")')"

# Record workflow event
sqlite3 "$DB" "INSERT INTO workflow_events (run_id, workflow, event, label, issue_number)
  VALUES ('$RUN_ID', '${WORKFLOW_NAME:-manual}', 'started', 'agent:$AGENT', ${ISSUE_NUM:-NULL})"

# GitNexus: ensure index exists (runs only if missing, ~2-3 min first time)
if command -v gitnexus &>/dev/null; then
  if ! gitnexus status &>/dev/null; then
    echo "--- GITNEXUS: indexing repository (first run) ---"
    gitnexus analyze . 2>/dev/null || true
  fi
fi

# Run Claude CLI (foreground, no background — background + wait causes signal issues)
# Use stream-json to capture full transcript (tool calls, results, etc.)
claude -p "$PROMPT" --model claude-opus-4-6 --dangerously-skip-permissions --verbose --output-format stream-json > /tmp/agent-stream.jsonl 2>/tmp/agent-stderr.log
EXIT_CODE=$?

END_MS=$(date +%s%3N)
DURATION=$((END_MS - START_MS))

# Extract final result message from stream (last assistant text block)
RESPONSE=$(grep '"type":"result"' /tmp/agent-stream.jsonl | tail -1 | jq -r '.result // empty' 2>/dev/null)
# Parse usage from result message
TOKENS_IN=$(grep '"type":"result"' /tmp/agent-stream.jsonl | tail -1 | jq -r '.usage.input_tokens // 0' 2>/dev/null || echo 0)
TOKENS_OUT=$(grep '"type":"result"' /tmp/agent-stream.jsonl | tail -1 | jq -r '.usage.output_tokens // 0' 2>/dev/null || echo 0)

# Extract tool usage summary for diagnostics (which tools were called)
TOOLS_USED=$(grep '"type":"tool_use"' /tmp/agent-stream.jsonl | jq -r '.name // empty' 2>/dev/null | sort | uniq -c | sort -rn | head -20)

# Keep JSON format for backwards compatibility
jq -n --arg result "$RESPONSE" --argjson input "${TOKENS_IN:-0}" --argjson output "${TOKENS_OUT:-0}" \
  '{result: $result, usage: {input_tokens: $input, output_tokens: $output}}' > /tmp/agent-result.json 2>/dev/null

# Estimate cost (Claude Max = fixed, but track for capacity planning)
COST=$(echo "scale=4; $TOKENS_IN * 0.000015 + $TOKENS_OUT * 0.000075" | bc 2>/dev/null || echo "0")

# Determine status
if [ $EXIT_CODE -eq 0 ]; then
  STATUS="success"
  ERROR_MSG=""
else
  STATUS="error"
  ERROR_MSG=$(cat /tmp/agent-stderr.log | head -500 | sed "s/'/''/g")
fi

# Record finish
sqlite3 "$DB" "UPDATE agent_runs SET
  finished_at = datetime('now'),
  status = '$STATUS',
  exit_code = $EXIT_CODE,
  tokens_in = ${TOKENS_IN:-0},
  tokens_out = ${TOKENS_OUT:-0},
  duration_ms = $DURATION,
  cost_usd = ${COST:-0},
  error_message = '${ERROR_MSG}'
  WHERE run_id = '$RUN_ID'"

# Log stdout (full response)
sqlite3 "$DB" "INSERT INTO agent_logs (run_id, log_type, content)
  VALUES ('$RUN_ID', 'response', '$(echo "$RESPONSE" | head -10000 | sed "s/'/''/g")')"

# Log stderr if any
if [ -s /tmp/agent-stderr.log ]; then
  sqlite3 "$DB" "INSERT INTO agent_logs (run_id, log_type, content)
    VALUES ('$RUN_ID', 'stderr', '$(cat /tmp/agent-stderr.log | sed "s/'/''/g")')"
fi

# Log tool usage summary (shows which tools agent actually used)
if [ -n "$TOOLS_USED" ]; then
  sqlite3 "$DB" "INSERT INTO agent_logs (run_id, log_type, content)
    VALUES ('$RUN_ID', 'tools', '$(echo "$TOOLS_USED" | sed "s/'/''/g")')"
fi

# Log whether key workflow steps happened
WORKFLOW_CHECK=""

# Extract which skills were invoked (by name)
SKILLS_INVOKED=$(grep -o '"skill":"[^"]*"' /tmp/agent-stream.jsonl 2>/dev/null | sort -u | sed 's/"skill":"//;s/"//' | tr '\n' ',' | sed 's/,$//')
if [ -n "$SKILLS_INVOKED" ]; then
  WORKFLOW_CHECK="${WORKFLOW_CHECK}skills:[${SKILLS_INVOKED}] "
else
  WORKFLOW_CHECK="${WORKFLOW_CHECK}skills:NONE "
fi

if grep -q '"TeamCreate"' /tmp/agent-stream.jsonl 2>/dev/null; then
  WORKFLOW_CHECK="${WORKFLOW_CHECK}team:yes "
else
  WORKFLOW_CHECK="${WORKFLOW_CHECK}team:NO "
fi
if grep -q '"TaskCreate"' /tmp/agent-stream.jsonl 2>/dev/null; then
  WORKFLOW_CHECK="${WORKFLOW_CHECK}tasks:yes "
else
  WORKFLOW_CHECK="${WORKFLOW_CHECK}tasks:NO "
fi
if grep -q 'gitnexus' /tmp/agent-stream.jsonl 2>/dev/null; then
  WORKFLOW_CHECK="${WORKFLOW_CHECK}gitnexus:yes "
else
  WORKFLOW_CHECK="${WORKFLOW_CHECK}gitnexus:NO "
fi
if grep -q 'index_codebase\|deepcontext' /tmp/agent-stream.jsonl 2>/dev/null; then
  WORKFLOW_CHECK="${WORKFLOW_CHECK}deepcontext:yes "
else
  WORKFLOW_CHECK="${WORKFLOW_CHECK}deepcontext:NO "
fi
sqlite3 "$DB" "INSERT INTO agent_logs (run_id, log_type, content)
  VALUES ('$RUN_ID', 'workflow_check', '$WORKFLOW_CHECK')"

# Record workflow completion
sqlite3 "$DB" "INSERT INTO workflow_events (run_id, workflow, event, label, issue_number,
  details) VALUES ('$RUN_ID', '${WORKFLOW_NAME:-manual}',
  '$([ $EXIT_CODE -eq 0 ] && echo completed || echo failed)',
  'agent:$AGENT', ${ISSUE_NUM:-NULL},
  '{\"duration_ms\": $DURATION, \"tokens\": ${TOKENS_IN:-0}, \"exit_code\": $EXIT_CODE}')"

exit $EXIT_CODE
