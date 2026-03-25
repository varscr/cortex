FROM oven/bun:latest

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install Node.js (required for Claude Code CLI)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI globally via npm
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /app

# Install dependencies first (cache layer)
COPY package.json bun.lock* ./
RUN bun install

# Copy app source
COPY . .

# Expose Nuxt default port
EXPOSE 3000

# Development mode with hot reload
CMD ["bunx", "nuxt", "dev", "--host", "0.0.0.0"]
