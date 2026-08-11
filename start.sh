#!/bin/bash

# Install Playwright browsers if not exists
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
  echo "Installing Playwright browsers..."
  npx playwright install --with-deps chromium
fi

# Start the dashboard
node server/index.js
