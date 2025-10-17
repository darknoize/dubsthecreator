#!/bin/bash

# Fast Homebrew Installation - Alternative Method
# This script bypasses common installation issues

set -e

echo "🚀 Fast-track Homebrew Installation"
echo "=================================="

# Function to attempt Command Line Tools installation via multiple methods
install_cli_tools_fast() {
    echo "📦 Attempting fast Command Line Tools installation..."
    
    # Method 1: Direct download (if available)
    echo "🔍 Checking for existing installation..."
    
    # Check if tools are already there but not linked
    if [[ -d "/Library/Developer/CommandLineTools" ]]; then
        echo "📁 Command Line Tools directory exists"
        sudo xcode-select --switch /Library/Developer/CommandLineTools
        
        if xcode-select -p &> /dev/null; then
            echo "✅ Command Line Tools activated successfully!"
            return 0
        fi
    fi
    
    # Method 2: Try softwareupdate (faster than GUI)
    echo "💾 Trying software update method..."
    
    # List available updates
    echo "🔍 Checking for Command Line Tools updates..."
    local clt_update=$(softwareupdate -l 2>/dev/null | grep -i "command line tools" | head -1 | awk -F"*" '{print $2}' | sed 's/^ *//' | tr -d '\n') || true
    
    if [[ -n "$clt_update" ]]; then
        echo "📥 Found update: $clt_update"
        echo "⏬ Installing via softwareupdate (this is faster)..."
        sudo softwareupdate -i "$clt_update" --verbose
        
        # Verify installation
        if xcode-select -p &> /dev/null; then
            echo "✅ Command Line Tools installed via softwareupdate!"
            return 0
        fi
    else
        echo "ℹ️  No Command Line Tools updates found via softwareupdate"
    fi
    
    # Method 3: Alternative package approach
    echo "🔧 Trying alternative installation method..."
    
    # Try the traditional way but with timeout
    timeout 60 xcode-select --install 2>/dev/null || true
    
    echo "⏰ Waiting briefly for installation to start..."
    sleep 5
    
    # Check if it worked
    if xcode-select -p &> /dev/null; then
        echo "✅ Command Line Tools installed!"
        return 0
    fi
    
    return 1
}

# Function to install Homebrew with minimal dependencies
install_homebrew_minimal() {
    echo "🍺 Installing Homebrew (minimal approach)..."
    
    # Check if we can bypass some checks
    export CI=1  # This can skip some interactive prompts
    export NONINTERACTIVE=1
    
    # Create necessary directories first
    sudo mkdir -p /opt/homebrew
    sudo chown -R $(whoami) /opt/homebrew
    
    # Download installer with retries
    local installer_url="https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh"
    local max_retries=3
    local retry=0
    
    while [ $retry -lt $max_retries ]; do
        echo "📥 Downloading Homebrew installer (attempt $((retry + 1))/$max_retries)..."
        
        if curl -fsSL "$installer_url" -o /tmp/homebrew-install.sh; then
            echo "✅ Download successful!"
            break
        else
            echo "❌ Download failed, retrying..."
            retry=$((retry + 1))
            sleep 2
        fi
    done
    
    if [ $retry -eq $max_retries ]; then
        echo "❌ Failed to download installer after $max_retries attempts"
        return 1
    fi
    
    # Run installer
    echo "🔧 Running Homebrew installer..."
    chmod +x /tmp/homebrew-install.sh
    /bin/bash /tmp/homebrew-install.sh
    
    # Clean up
    rm -f /tmp/homebrew-install.sh
    
    return 0
}

# Function to setup Homebrew environment
setup_homebrew_env() {
    echo "⚙️  Setting up Homebrew environment..."
    
    # Detect architecture and set paths
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
        # Apple Silicon
        HOMEBREW_PREFIX="/opt/homebrew"
        echo "🔧 Detected Apple Silicon Mac"
    elif [[ -f "/usr/local/bin/brew" ]]; then
        # Intel
        HOMEBREW_PREFIX="/usr/local"
        echo "🔧 Detected Intel Mac"
    else
        echo "❌ Homebrew binary not found"
        return 1
    fi
    
    # Add to current session
    export PATH="$HOMEBREW_PREFIX/bin:$PATH"
    
    # Add to shell profile
    local shell_profile=""
    if [[ "$SHELL" == *"zsh"* ]]; then
        shell_profile="$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        shell_profile="$HOME/.bash_profile"
    fi
    
    if [[ -n "$shell_profile" ]]; then
        echo "📝 Adding Homebrew to $shell_profile"
        echo "# Homebrew" >> "$shell_profile"
        echo "export PATH=\"$HOMEBREW_PREFIX/bin:\$PATH\"" >> "$shell_profile"
        echo "✅ Shell profile updated"
    fi
    
    return 0
}

# Main function
main() {
    echo "🎯 Starting fast-track installation..."
    
    # Check if already installed
    if command -v brew &> /dev/null; then
        echo "✅ Homebrew is already installed!"
        echo "📍 Location: $(which brew)"
        echo "📊 Version: $(brew --version | head -1)"
        exit 0
    fi
    
    # Step 1: Install Command Line Tools
    echo "Step 1: Command Line Tools"
    if ! install_cli_tools_fast; then
        echo "⚠️  Command Line Tools installation had issues"
        echo "💡 Continuing anyway - Homebrew might still work"
    fi
    
    # Step 2: Install Homebrew
    echo "Step 2: Homebrew Installation"
    if install_homebrew_minimal; then
        echo "✅ Homebrew installation completed!"
    else
        echo "❌ Homebrew installation failed"
        exit 1
    fi
    
    # Step 3: Setup environment
    echo "Step 3: Environment Setup"
    if setup_homebrew_env; then
        echo "✅ Environment setup completed!"
    else
        echo "⚠️  Environment setup had issues"
    fi
    
    # Step 4: Verify
    echo "Step 4: Verification"
    export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
    
    if command -v brew &> /dev/null; then
        echo "🎉 SUCCESS! Homebrew is ready to use!"
        echo ""
        echo "📍 Location: $(which brew)"
        echo "📊 Version: $(brew --version | head -1)"
        echo ""
        echo "💡 Next steps:"
        echo "   • Restart your terminal: exec $SHELL"
        echo "   • Or reload profile: source ~/.zshrc"
        echo "   • Test installation: brew --version"
        echo "   • Install packages: brew install <package-name>"
    else
        echo "⚠️  Installation completed but brew command not found"
        echo "💡 Try restarting your terminal and running: brew --version"
    fi
}

# Handle interrupts gracefully
trap 'echo "❌ Installation interrupted"; exit 1' INT TERM

# Run main function
main "$@"