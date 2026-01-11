#!/bin/bash
# 1. Copy the config from the repo to sites-available
sudo cp ./deployment/nginx/calorie-tracker-api /etc/nginx/sites-available/calorie-tracker-api

# 2. Enable the site by creating a symlink if it doesn't exist
sudo ln -sf /etc/nginx/sites-available/calorie-tracker-api /etc/nginx/sites-enabled/

# 3. Test and Reload
sudo nginx -t && sudo systemctl reload nginx