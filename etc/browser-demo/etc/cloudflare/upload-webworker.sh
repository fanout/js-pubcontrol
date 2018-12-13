#!/usr/bin/env bash

THIS_DIR="$(dirname "$(readlink -f "$0")")"
default_worker="$THIS_DIR/../../dist/*.webworker.js"

# https://developers.cloudflare.com/workers/api/#upload-a-worker
function upload_worker() {
  echo "upload_worker $@"
  worker="${1:-default_worker}"
  curl "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/workers/script" \
    -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
    -X PUT \
    -H "X-Auth-Key: $CLOUDFLARE_AUTH_KEY" \
    -H "Content-Type:application/javascript" \
    --data-binary "@$worker"
}

function require_vars () {
    missing=false
    for var in "$@"; do
        # echo "require_var $var=${!var}"
        if [ -z ${!var+x} ]; then
            echo "var is unset but required: $var"
            missing=true
        fi
    done
    if [ "$missing" == "true" ]; then
        exit 1
    fi
}

function main() {
  require_vars CLOUDFLARE_EMAIL CLOUDFLARE_AUTH_KEY CLOUDFLARE_ZONE_ID
  upload_worker $@
}

main $@