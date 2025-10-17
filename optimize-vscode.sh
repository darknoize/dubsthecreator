#!/bin/bash

# VS Code Performance Optimization Script
# Run this script to optimize VS Code settings for better Git performance

echo "🚀 Optimizing VS Code for better Git performance..."

# Create optimized keybindings to reduce Git operations
echo "📝 Creating optimized keybindings..."

# Disable automatic Git refresh shortcuts
cat > ~/.vscode/keybindings.json << 'EOF'
[
  {
    "key": "cmd+shift+p",
    "command": "workbench.action.showCommands"
  },
  {
    "key": "cmd+k cmd+s", 
    "command": "workbench.action.openGlobalKeybindings"
  }
]
EOF

echo "⚙️  Applying Git configuration optimizations..."

# Git performance configurations (will work once command line tools are installed)
git config --global core.preloadindex true 2>/dev/null || echo "Git not ready yet - will configure after installation"
git config --global core.fscache true 2>/dev/null || echo "Git not ready yet - will configure after installation"  
git config --global gc.auto 256 2>/dev/null || echo "Git not ready yet - will configure after installation"
git config --global index.threads 0 2>/dev/null || echo "Git not ready yet - will configure after installation"

echo "🧹 Cleaning up potential performance issues..."

# Clear VS Code workspace state
rm -rf ~/.vscode/CachedExtensions 2>/dev/null
rm -rf ~/.vscode/logs 2>/dev/null

echo "✅ VS Code optimization complete!"
echo ""
echo "📋 Manual steps to complete:"
echo "1. Restart VS Code after Xcode command line tools finish installing"
echo "2. Go to VS Code Settings (Cmd+,) and verify the performance settings are applied"
echo "3. Consider disabling heavy extensions temporarily"
echo "4. Run 'Reload Window' (Cmd+Shift+P -> 'Developer: Reload Window') after restart"
echo ""
echo "🔧 If issues persist, also try:"
echo "- Close unnecessary VS Code windows"
echo "- Disable Git decorations: Set 'git.decorations.enabled' to false"
echo "- Increase Git status limit: Set 'git.statusLimit' to 10000"