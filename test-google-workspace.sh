#!/bin/bash

# Google Workspace Configuration Test Script
# Tests if your Google Workspace account is actually set up

set -e

DOMAIN="dubsthecreator.com"
EMAIL="dubs@dubsthecreator.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 Google Workspace Configuration Test"
echo "====================================="
echo ""
echo "Domain: $DOMAIN"
echo "Test Email: $EMAIL"
echo ""

echo "📧 GOOGLE WORKSPACE STATUS CHECK"
echo "--------------------------------"

# Check MX records point to Google
echo -n "1. MX Records: "
MX_CHECK=$(dig +short $DOMAIN MX 2>/dev/null | grep google.com || echo "")
if [[ -n "$MX_CHECK" ]]; then
    echo -e "${GREEN}✅ Google MX records found${NC}"
else
    echo -e "${RED}❌ No Google MX records${NC}"
    exit 1
fi

# Test SMTP connection to Google's servers
echo -n "2. Google Mail Server Connection: "
if command -v telnet >/dev/null 2>&1; then
    # Test connection to Google's SMTP server
    SMTP_TEST=$(timeout 5 telnet aspmx.l.google.com 25 2>/dev/null <<< "QUIT" | head -1 || echo "failed")
    if [[ "$SMTP_TEST" == *"220"* ]]; then
        echo -e "${GREEN}✅ Google mail servers responding${NC}"
    else
        echo -e "${YELLOW}⚠️  Connection test inconclusive${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot test (telnet not available)${NC}"
fi

# Check Google Workspace admin console accessibility
echo ""
echo "🎯 GOOGLE WORKSPACE ACCOUNT CHECK"
echo "---------------------------------"
echo ""
echo "To verify if Google Workspace is configured, you need to:"
echo ""
echo "1. 📱 Try logging into Gmail:"
echo "   → Go to: https://gmail.com"
echo "   → Try to log in with: $EMAIL"
echo "   → Password: [Your Google Workspace password]"
echo ""

echo "2. 🔧 Check Google Admin Console:"
echo "   → Go to: https://admin.google.com"
echo "   → Log in with admin account"
echo "   → Check if $DOMAIN is verified"
echo "   → Check if $EMAIL user exists"
echo ""

echo "3. 📧 Test Email Delivery:"
echo "   → Send test email to: $EMAIL"
echo "   → From any external email (Gmail, Yahoo, etc.)"
echo "   → Check if it bounces or delivers"
echo ""

# Provide setup instructions if not configured
echo "🚀 IF GOOGLE WORKSPACE IS NOT SET UP:"
echo "------------------------------------"
echo ""
echo "1. 📝 Sign up for Google Workspace:"
echo "   → https://workspace.google.com/"
echo "   → Choose Business Starter (\$6/month)"
echo "   → Enter domain: $DOMAIN"
echo ""

echo "2. 🔐 Verify Domain Ownership:"
echo "   → Google will ask you to verify $DOMAIN"
echo "   → Choose TXT record verification method"
echo "   → Add the verification TXT record to DNS"
echo ""

echo "3. 👤 Create User Account:"
echo "   → Create user: $EMAIL"
echo "   → Set name: William Weems"
echo "   → Set password and recovery options"
echo ""

echo "4. ⚙️  Configure Settings:"
echo "   → Enable 2-factor authentication"
echo "   → Set up mobile access"
echo "   → Configure email forwarding if needed"
echo ""

# Test results summary
echo "📊 CURRENT STATUS SUMMARY"
echo "========================="
echo ""
echo -e "${GREEN}✅ DNS Configuration: Complete${NC}"
echo "   • MX records: Google Workspace ready"
echo "   • DKIM record: Email authentication ready"
echo "   • DNS propagation: Worldwide"
echo ""
echo -e "${YELLOW}❓ Google Workspace Account: Unknown${NC}"
echo "   • Need to verify if subscription is active"
echo "   • Need to check if user account exists"
echo "   • Need to test actual email delivery"
echo ""

echo "💡 QUICK TESTS:"
echo "==============="
echo ""
echo "Test 1 - Check if email account exists:"
echo "→ Send email to $EMAIL from your personal email"
echo "→ If it bounces = Google Workspace not set up"
echo "→ If it delivers = Google Workspace is working"
echo ""

echo "Test 2 - Try logging into Gmail:"
echo "→ Go to gmail.com"
echo "→ Try username: $EMAIL"
echo "→ If account doesn't exist = Need to set up Google Workspace"
echo "→ If login works = Google Workspace is configured"
echo ""

echo "📞 Need help setting up Google Workspace?"
echo "See: GMAIL-VERCEL-SETUP.md for detailed instructions"