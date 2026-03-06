#!/bin/bash

# Script to open Firebase Console to enable Google Authentication
PROJECT_ID="adk-assistant-bfd43"
URL="https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers"

echo "================================================"
echo "  Firebase Authentication Configuration"
echo "================================================"
echo ""
echo "Opening Firebase Console to enable Google Sign-in..."
echo ""
echo "Steps to follow:"
echo "1. Click 'Get Started' (if this is your first time)"
echo "2. Find and click on 'Google' in the sign-in providers list"
echo "3. Toggle 'Enable' to ON"
echo "4. Add your email as the support email"
echo "5. Click 'Save'"
echo ""
echo "Opening: $URL"
echo ""

# Open the URL in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$URL"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    start "$URL"
else
    echo "Please manually open this URL in your browser:"
    echo "$URL"
fi

echo ""
echo "After enabling Google Auth, you can run:"
echo "  docker-compose up --build"
echo ""
