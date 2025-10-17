#!/bin/bash

# Optimized Homebrew Installation Script
# This script handles common installation delays and provides progress feedback

set -e

echo "🚀 Starting optimized Homebrew installation..."

# Function to check if Command Line Tools are installed
check_xcode_tools() {
    if xcode-select -p &> /dev/null; then
        echo "✅ Xcode Command Line Tools are installed"
        return 0
    else
        echo "❌ Xcode Command Line Tools not found"
        return 1
    fi
}

# Function to install Command Line Tools with timeout
install_xcode_tools() {
    echo "📦 Installing Xcode Command Line Tools..."
    
    # Check if installation is already in progress
    if pgrep -f "Install Command Line Developer Tools" > /dev/null; then
        echo "⏳ Command Line Tools installation already in progress..."
        echo "💡 Please complete the installation dialog if it's open"
        echo "   Or wait for the current installation to finish"
        
        # Wait for installation to complete (with timeout)
        local timeout=300  # 5 minutes
        local elapsed=0
        
        while pgrep -f "Install Command Line Developer Tools" > /dev/null && [ $elapsed -lt $timeout ]; do
            echo "⏱️  Waiting... ($elapsed/$timeout seconds)"
            sleep 10
            elapsed=$((elapsed + 10))
        done
        
        if [ $elapsed -ge $timeout ]; then
            echo "⚠️  Installation taking too long. You may need to:"
            echo "   1. Close any installation dialogs"
            echo "   2. Run: sudo xcode-select --reset"
            echo "   3. Try again with: xcode-select --install"
            return 1
        fi
    else
        # Start fresh installation
        echo "🔧 Starting Command Line Tools installation..."
        xcode-select --install
        
        echo "💡 A dialog should appear - please click 'Install' and wait"
        echo "⏳ Waiting for installation to start..."
        
        # Wait for installation dialog to appear
        sleep 5
        
        # Monitor installation progress
        while ! check_xcode_tools; do
            if pgrep -f "Install Command Line Developer Tools" > /dev/null; then
                echo "📥 Installation in progress..."
                sleep 30
            else
                echo "⚠️  Installation may have failed or been cancelled"
                echo "💡 Try running: xcode-select --install manually"
                return 1
            fi
        done
    fi
    
    echo "✅ Command Line Tools installation completed!"
}

# Function to install Homebrew with optimizations
install_homebrew() {
    echo "🍺 Installing Homebrew..."
    
    # Use faster mirrors for better performance
    export HOMEBREW_API_DOMAIN="https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/api"
    export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles"
    export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git"
    export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git"
    
    # Download and run Homebrew installer
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH
    echo "🔧 Configuring Homebrew in PATH..."
    
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
        # Apple Silicon Mac
        echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
        export PATH="/opt/homebrew/bin:$PATH"
        HOMEBREW_PREFIX="/opt/homebrew"
    elif [[ -f "/usr/local/bin/brew" ]]; then
        # Intel Mac
        echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
        export PATH="/usr/local/bin:$PATH"
        HOMEBREW_PREFIX="/usr/local"
    else
        echo "❌ Homebrew installation failed"
        return 1
    fi
    
    # Reload shell configuration
    source ~/.zshrc 2>/dev/null || true
    
    echo "✅ Homebrew installed successfully!"
    echo "📍 Homebrew location: $HOMEBREW_PREFIX"
}

# Function to verify Homebrew installation
verify_homebrew() {
    echo "🔍 Verifying Homebrew installation..."
    
    if command -v brew &> /dev/null; then
        echo "✅ Homebrew is working!"
        echo "📊 Homebrew version: $(brew --version | head -1)"
        echo "📍 Homebrew location: $(which brew)"
        
        # Run basic diagnostics
        echo "🩺 Running Homebrew diagnostics..."
        brew doctor --verbose 2>/dev/null || echo "⚠️  Some warnings found (this is normal)"
        
        return 0
    else
        echo "❌ Homebrew verification failed"
        return 1
    fi
}

# Main installation flow
main() {
    echo "🎯 Homebrew Installation Optimizer"
    echo "================================="
    
    # Check if Homebrew is already installed
    if command -v brew &> /dev/null; then
        echo "✅ Homebrew is already installed!"
        verify_homebrew
        exit 0
    fi
    
    # Step 1: Ensure Command Line Tools are installed
    if ! check_xcode_tools; then
        install_xcode_tools
        if ! check_xcode_tools; then
            echo "❌ Failed to install Command Line Tools"
            echo "💡 Please install manually and try again"
            exit 1
        fi
    fi
    
    # Step 2: Install Homebrew
    install_homebrew
    
    # Step 3: Verify installation
    if verify_homebrew; then
        echo "🎉 Homebrew installation completed successfully!"
        echo ""
        echo "💡 Next steps:"
        echo "   • Restart your terminal or run: source ~/.zshrc"
        echo "   • Install packages with: brew install <package>"
        echo "   • Update with: brew update && brew upgrade"
    else
        echo "❌ Installation completed but verification failed"
        echo "💡 Try restarting your terminal and running: brew --version"
    fi
}

# Run the main function
main "$@"