#!/bin/sh
set -e

echo "[entrypoint] Starting opencode serve on port 4096..."
opencode serve --port 4096 &

echo "[entrypoint] Waiting for opencode server..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:4096/session > /dev/null 2>&1; then
    echo "[entrypoint] opencode server ready after ${i}s"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[entrypoint] WARNING: opencode server not ready after 30s, starting Nuxt anyway"
  fi
  sleep 1
done

echo "[entrypoint] Starting Nuxt dev server..."
exec bunx nuxt dev --host 0.0.0.0
