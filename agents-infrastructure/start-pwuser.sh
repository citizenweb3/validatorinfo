#!/bin/bash
set -e

# Git config
git config --global user.email "agent@builder.local"
git config --global user.name "Agent Builder"
gh auth setup-git

# DeepContext MCP (semantic code search)
if [ -n "$WILDCARD_API_KEY" ]; then
    echo "--- CONFIGURING DEEPCONTEXT MCP ---"
    claude mcp add deepcontext -s user -e WILDCARD_API_KEY=$WILDCARD_API_KEY -- npx -y @wildcard-ai/deepcontext@latest 2>/dev/null || true
fi

# Figma MCP (design-to-code via Framelink, uses Figma REST API with personal access token)
if [ -n "$FIGMA_ACCESS_TOKEN" ]; then
    echo "--- CONFIGURING FIGMA MCP ---"
    claude mcp add figma -s user -- npx -y figma-developer-mcp --figma-api-key=$FIGMA_ACCESS_TOKEN --stdio 2>/dev/null || true
fi

# Context7 MCP (library documentation)
echo "--- CONFIGURING CONTEXT7 MCP ---"
claude mcp add context7 -s user -- npx -y @upstash/context7-mcp 2>/dev/null || true

# Register and start GitHub Actions runner
cd /home/pwuser/actions-runner
if [ ! -f .runner ]; then
    echo "--- REGISTERING RUNNER ---"
    echo "Labels: ${RUNNER_LABELS}"
    ./config.sh --url "${GITHUB_URL}" \
                --token "${GITHUB_RUNNER_TOKEN}" \
                --labels "${RUNNER_LABELS:-self-hosted,builder}" \
                --name "${RUNNER_NAME:-agent}" \
                --unattended --replace
fi

echo "--- STARTING LISTENER ---"
./run.sh
