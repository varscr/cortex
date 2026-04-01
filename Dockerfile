FROM oven/bun:latest

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install Node.js (required for Claude Code CLI)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI globally via bun
RUN bun install -g @anthropic-ai/claude-code

# Install OpenCode CLI globally via bun
RUN bun install -g opencode-ai

WORKDIR /app

# Install dependencies first (cache layer)
COPY package.json bun.lock* ./
RUN bun install

# Copy app source
COPY . .
RUN chmod +x /app/entrypoint.sh

# Expose Nuxt default port
EXPOSE 3000

# Start opencode serve + Nuxt via entrypoint
CMD ["/app/entrypoint.sh"]
