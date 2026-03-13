FROM oven/bun:latest

RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-eng && rm -rf /var/lib/apt/lists/*

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
