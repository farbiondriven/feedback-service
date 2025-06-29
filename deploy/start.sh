#!/bin/sh
set -e

export BACKEND_PORT=9000
node /app/dist/server.js &
FASTIFY_PID=$!

# 2. Launch nginx in the foreground
exec nginx -g 'daemon off;'
