#!/usr/bin/env bash
set -e

OUTPUT=$(vercel --prod 2>&1)
echo "$OUTPUT"

DEPLOYMENT=$(echo "$OUTPUT" | grep -oP 'graduabm-frontend-[a-z0-9]+-lenzmateus-projects\.vercel\.app' | head -1)

if [ -n "$DEPLOYMENT" ]; then
  vercel alias set "$DEPLOYMENT" protocolobravomike.com.br
  vercel alias set "$DEPLOYMENT" www.protocolobravomike.com.br
else
  echo "Aviso: não foi possível extrair URL do deployment para re-alias."
fi
