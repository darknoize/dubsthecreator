#!/bin/bash

# 🚀 Vercel Pro Deployment Script for Dubs The Creator Portfolio

echo "🚀 Starting Vercel Pro deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Optimize images before deployment (if ImageMagick is available)
if command -v magick &> /dev/null; then
    echo "🖼️ Optimizing images..."
    find images -name "*.jpg" -o -name "*.png" | while read img; do
        if [[ ! -f "${img%.*}.webp" ]]; then
            magick "$img" -quality 85 "${img%.*}.webp"
            echo "✅ Converted $img to WebP"
        fi
    done
fi

# Validate important files exist
echo "🔍 Validating deployment files..."

if [[ ! -f "vercel.json" ]]; then
    echo "❌ vercel.json not found!"
    exit 1
fi

if [[ ! -f "index.html" ]]; then
    echo "❌ index.html not found!"
    exit 1
fi

echo "✅ All required files present"

# Deploy to Vercel Pro
echo "🚀 Deploying to Vercel Pro..."
vercel --prod --confirm

# Check deployment status
if [[ $? -eq 0 ]]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📊 Next steps:"
    echo "1. Enable Analytics in Vercel dashboard"
    echo "2. Set up custom domain if needed"
    echo "3. Configure environment variables"
    echo "4. Monitor performance metrics"
    echo ""
    echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
else
    echo "❌ Deployment failed!"
    exit 1
fi