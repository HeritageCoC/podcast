#!/bin/bash

# Simple Roku Enhancement Integration
# This script runs AFTER your existing media generator to enhance the roku-feed.json

echo "🚀 Starting Roku feed enhancement..."

# Check if base roku-feed.json exists (created by your existing workflow)
if [ ! -f "roku-feed.json" ]; then
    echo "❌ roku-feed.json not found!"
    echo "💡 This script enhances your existing roku-feed.json"
    echo "💡 Please run your main media generator first"
    exit 1
fi

echo "✅ Found existing roku-feed.json"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if roku enhancer script exists
if [ ! -f "roku-feed-enhancer.js" ]; then
    echo "❌ roku-feed-enhancer.js not found!"
    echo "💡 Please add the roku-feed-enhancer.js file to your repository"
    exit 1
fi

# Get info about existing feed
EXISTING_COUNT=$(jq '.movies | length' roku-feed.json 2>/dev/null || echo "0")
echo "📚 Existing roku-feed.json has $EXISTING_COUNT movies"

# Run the enhancer
echo "🔧 Enhancing Roku feed with live streaming and additional content..."
node roku-feed-enhancer.js

# Check if enhancement was successful
if [ $? -eq 0 ]; then
    echo "✅ Roku feed enhancement completed successfully!"
    
    # Show what was created
    if [ -f "roku-feed-enhanced.json" ]; then
        ENHANCED_COUNT=$(jq '.movies | length' roku-feed-enhanced.json 2>/dev/null || echo "0")
        echo "📺 Enhanced feed now has $ENHANCED_COUNT movies"
        
        # Check if this is in GitHub Actions
        if [ -n "$GITHUB_ACTIONS" ]; then
            echo "🔄 In GitHub Actions - adding enhanced files..."
            git add roku-feed-enhanced.json roku-direct-publisher-feed.json roku-enhancement-info.json 2>/dev/null || true
        fi
    fi
    
    echo ""
    echo "📁 Files created/updated:"
    [ -f "roku-feed-enhanced.json" ] && echo "  ✓ roku-feed-enhanced.json (enhanced version)"
    [ -f "roku-direct-publisher-feed.json" ] && echo "  ✓ roku-direct-publisher-feed.json (for Roku submission)" 
    [ -f "roku-enhancement-info.json" ] && echo "  ✓ roku-enhancement-info.json (deployment guide)"
    
    echo ""
    echo "🎯 Next steps:"
    echo "1. Configure Vimeo showcase IDs in roku-feed-enhancer.js"
    echo "2. Set up your livestream URL"
    echo "3. Submit this URL to Roku Direct Publisher:"
    echo "   https://heritagecoc.github.io/podcast/roku-direct-publisher-feed.json"
    
else
    echo "❌ Roku feed enhancement failed!"
    exit 1
fi
