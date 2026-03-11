#!/bin/bash

# === ROOT-ONLY SECTION (dirs, permissions, auth) ===

# Auth config
if [ -n "$CLAUDE_CODE_OAUTH_TOKEN" ]; then
    echo "--- CONFIGURING CLAUDE AUTH ---"
    for HOMEDIR in /root /home/pwuser; do
        mkdir -p "$HOMEDIR/.claude"
        cat > "$HOMEDIR/.claude.json" <<AUTHEOF
{
  "hasCompletedOnboarding": true,
  "oauthAccount": {
    "accountUuid": "${CLAUDE_ACCOUNT_UUID}",
    "emailAddress": "${CLAUDE_EMAIL}",
    "organizationUuid": "${CLAUDE_ORG_UUID}"
  }
}
AUTHEOF
        echo '{"env":{"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS":"1"}}' > "$HOMEDIR/.claude/settings.json"
    done
    chown -R pwuser:pwuser /home/pwuser/.claude /home/pwuser/.claude.json
fi

# Monitoring DB
mkdir -p /data/monitoring
if [ ! -f /data/monitoring/monitoring.db ]; then
    echo "--- INITIALIZING MONITORING DB ---"
    sqlite3 /data/monitoring/monitoring.db <<'SQL'
CREATE TABLE IF NOT EXISTS agent_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT UNIQUE,
  agent TEXT NOT NULL, role TEXT NOT NULL, trigger TEXT NOT NULL,
  issue_number INTEGER, prompt_file TEXT, prompt_hash TEXT,
  started_at TEXT NOT NULL, finished_at TEXT, status TEXT DEFAULT 'running',
  exit_code INTEGER, tokens_in INTEGER, tokens_out INTEGER,
  duration_ms INTEGER, cost_usd REAL, error_message TEXT, metadata TEXT
);
CREATE TABLE IF NOT EXISTS agent_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT NOT NULL,
  log_type TEXT NOT NULL, content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS workflow_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT,
  workflow TEXT NOT NULL, event TEXT NOT NULL, label TEXT,
  issue_number INTEGER, details TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
SQL
fi
chmod 666 /data/monitoring/monitoring.db
chmod 777 /data/monitoring

# Fix ownership for everything pwuser needs
chown -R pwuser:pwuser /home/pwuser/actions-runner
mkdir -p /home/pwuser/actions-runner/_work
chown -R pwuser:pwuser /home/pwuser/actions-runner/_work

# === SWITCH TO PWUSER FOR EVERYTHING ELSE ===
# Use a separate script file to avoid su -c quoting issues with long scripts
cp /root/start-pwuser.sh /home/pwuser/start-pwuser.sh
chmod +x /home/pwuser/start-pwuser.sh
chown pwuser:pwuser /home/pwuser/start-pwuser.sh
exec su -s /bin/bash pwuser -c '/home/pwuser/start-pwuser.sh'
