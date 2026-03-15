#!/bin/bash
# agents-tools/log-social.sh — log any social media action
# Usage: ./agents-tools/log-social.sh --agent seo-vi --platform twitter --action post \
#        --account therealvalinfo --content "New APR data..." \
#        --result success --response '{"tweet_id": "123"}'

DB="/data/monitoring/monitoring.db"
RUN_ID="${GITHUB_RUN_ID:-manual-$(date +%s)}"

while [[ $# -gt 0 ]]; do
  case $1 in
    --platform) PLATFORM="$2"; shift 2 ;;
    --action) ACTION="$2"; shift 2 ;;
    --agent) AGENT="$2"; shift 2 ;;
    --account) ACCOUNT="$2"; shift 2 ;;
    --target) TARGET_URL="$2"; shift 2 ;;
    --content) CONTENT="$2"; shift 2 ;;
    --result) RESULT="$2"; shift 2 ;;
    --response) RESPONSE_DATA="$2"; shift 2 ;;
    *) shift ;;
  esac
done

AGENT="${AGENT:-unknown}"

sqlite3 "$DB" "INSERT INTO social_actions
  (run_id, agent, platform, action, account, target_url, content, result, response_data)
  VALUES
  ('$RUN_ID', '$AGENT', '$PLATFORM', '$ACTION', '$ACCOUNT',
   '${TARGET_URL:-}', '$(echo "${CONTENT:-}" | sed "s/'/''/g")',
   '${RESULT:-unknown}', '$(echo "${RESPONSE_DATA:-}" | sed "s/'/''/g")')"
