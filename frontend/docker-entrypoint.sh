#!/bin/sh
set -e

# If a runtime API URL is provided and differs from the build-time placeholder,
# rewrite it in the compiled Next.js output before starting the server.
PLACEHOLDER="http://localhost:8000"
RUNTIME_URL="${NEXT_PUBLIC_API_BASE_URL:-}"

if [ -n "$RUNTIME_URL" ] && [ "$RUNTIME_URL" != "$PLACEHOLDER" ]; then
  echo "Rewriting API URL: $PLACEHOLDER -> $RUNTIME_URL"
  find /app/.next -type f -name "*.js" \
    -exec sed -i "s|${PLACEHOLDER}|${RUNTIME_URL}|g" {} \;
fi

exec npm run start
