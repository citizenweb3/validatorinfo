FROM mcr.microsoft.com/playwright:latest

# Utilities
RUN apt-get update && apt-get install -y \
    git curl wget jq nano openssh-client autossh \
    python3-pip xvfb postgresql-client sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20
RUN npm install -g n && n 20

# gh CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli.gpg] https://cli.github.com/packages stable main" \
    | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update && apt-get install -y gh && rm -rf /var/lib/apt/lists/*

# Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# GitHub Actions Runner (pinned version, auto-detect arch)
ARG RUNNER_VERSION=2.332.0
RUN ARCH=$(dpkg --print-architecture) \
    && if [ "$ARCH" = "arm64" ]; then ARCH_SUFFIX="arm64"; else ARCH_SUFFIX="x64"; fi \
    && mkdir -p /home/pwuser/actions-runner && cd /home/pwuser/actions-runner \
    && curl -o runner.tar.gz -L \
       "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-${ARCH_SUFFIX}-${RUNNER_VERSION}.tar.gz" \
    && tar xzf runner.tar.gz && rm runner.tar.gz \
    && chown -R pwuser:pwuser /home/pwuser/actions-runner

# Stay root — only runner needs non-root (handled in start.sh via su)
WORKDIR /root

COPY start.sh /root/start.sh
COPY start-pwuser.sh /root/start-pwuser.sh
RUN chmod +x /root/start.sh /root/start-pwuser.sh

CMD ["/root/start.sh"]
