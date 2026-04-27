#!/bin/bash
# Quick test to verify .env configuration

echo "🧪 Testing .env Configuration..."
echo ""

if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "✅ .env file exists"

# Check permissions
PERMS=$(stat -c %a .env)
if [ "$PERMS" != "600" ]; then
    echo "⚠️  .env permissions are $PERMS (should be 600)"
    echo "   Run: chmod 600 .env"
else
    echo "✅ .env has correct permissions (600)"
fi

# Check if gitignored
if git check-ignore -q .env; then
    echo "✅ .env is properly gitignored"
else
    echo "❌ .env is NOT gitignored!"
    exit 1
fi

# Load .env and check variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
    
    echo ""
    echo "📋 Configuration Variables:"
    echo "   GITHUB_REPO: $GITHUB_REPO"
    echo "   SITE_URL: $SITE_URL"
    echo "   GA4_MEASUREMENT_ID: $GA4_MEASUREMENT_ID"
    echo "   LOCAL_PORT: $LOCAL_PORT"
    
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "   GITHUB_TOKEN: ghp_****** (hidden)"
        echo "✅ GitHub token is set"
    else
        echo "❌ GITHUB_TOKEN is missing!"
        exit 1
    fi
fi

echo ""
echo "✅ All .env checks passed!"
