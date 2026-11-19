#!/bin/sh
# Rebuilds the web app and puts it at the top of the repository, where GitHub Pages serves it.
set -e
cd "$(dirname "$0")/app"
npm ci
npx vite build
cd ..
rm -rf assets
cp -r app/dist/. .
rm -rf app/dist
