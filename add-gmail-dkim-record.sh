#!/bin/bash

# Gmail DKIM DNS Record Addition Script
# Safe addition of Google DKIM record without affecting existing DNS

set -e

DOMAIN="dubsthecreator.com"
DKIM_HOST="google._domainkey"
DKIM_VALUE="v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsce9Dj/VIeTI8bHOEq2taB7Jb0+A6BamlzXL1W8NBRG2JC2HmFT8ZOzgCZghaJBzwNwW76wAExlKyQfQeODsgZb+cVdAyKa2H3IrSmITifaaaK486ei2ldU/ezxx2QUL7h6vMM49ti88zu2kA+xEXz59zLs0M4M1tci99vj14yYNghwfYNhiSU4nxL0maCMVkk9d8+KVKMrtweOwai6fCO+fKu4+MUbZMtgKq3nzmKEZgWANtq0wh3Sn5q+deQLYdclMLBs2/GVtoYXMHbNk/bd1ez/ZNrhYcrUq0QUOtkxClSuDJlpQSNg1nIWU48frKq6V+OwsFmi3CYOuFXbmgwIDAQAB"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔐 Gmail DKIM DNS Record Addition"
echo "================================="
echo ""
echo "Domain: $DOMAIN"
echo "DKIM Host: $DKIM_HOST"
echo "Record Type: TXT"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-flight checks
echo "🔍 PRE-FLIGHT SAFETY CHECKS"
echo "----------------------------"

# Check if website is currently working
echo -n "1. Checking website status... "
WEBSITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" 2>/dev/null || echo "000")
if [[ $WEBSITE_STATUS == "200" ]]; then
    echo -e "${GREEN}✅ Website is working (HTTP $WEBSITE_STATUS)${NC}"
else
    echo -e "${RED}❌ Website issue detected (HTTP $WEBSITE_STATUS)${NC}"
    echo -e "${YELLOW}⚠️  Consider postponing DNS changes until website is stable${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted for safety."
        exit 1
    fi
fi

# Check current DNS setup
echo -n "2. Checking current DNS setup... "
if command_exists dig; then
    CURRENT_A=$(dig +short $DOMAIN A 2>/dev/null | head -1)
    if [[ -n "$CURRENT_A" ]]; then
        echo -e "${GREEN}✅ DNS responding (A record: $CURRENT_A)${NC}"
    else
        echo -e "${YELLOW}⚠️  No A records found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  dig command not available, skipping DNS check${NC}"
fi

# Check if DKIM record already exists
echo -n "3. Checking for existing DKIM records... "
if command_exists dig; then
    EXISTING_DKIM=$(dig +short "$DKIM_HOST.$DOMAIN" TXT 2>/dev/null | tr -d '"')
    if [[ -n "$EXISTING_DKIM" ]]; then
        echo -e "${YELLOW}⚠️  Existing DKIM record found:${NC}"
        echo "   $EXISTING_DKIM"
        echo ""
        echo -e "${YELLOW}This will REPLACE the existing record. Continue? (y/N)${NC}"
        read -p "> " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Aborted to preserve existing record."
            exit 1
        fi
    else
        echo -e "${GREEN}✅ No existing DKIM record found - safe to add${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot check existing records without dig${NC}"
fi

echo ""

# Display the record that will be added
echo "📝 RECORD TO BE ADDED"
echo "---------------------"
echo -e "${BLUE}Host/Name:${NC} $DKIM_HOST"
echo -e "${BLUE}Type:${NC}      TXT"
echo -e "${BLUE}Value:${NC}     $DKIM_VALUE"
echo -e "${BLUE}TTL:${NC}       3600 (1 hour)"
echo ""

# Safety confirmation
echo -e "${YELLOW}⚠️  SAFETY CONFIRMATION${NC}"
echo "This script will provide you with the DNS record details to add manually."
echo "It will NOT automatically modify your DNS settings."
echo ""
echo -e "${GREEN}✅ This is SAFE because:${NC}"
echo "  • DKIM records don't affect website hosting"
echo "  • TXT records are additive (won't replace A/CNAME records)"
echo "  • You can remove the record easily if needed"
echo "  • Your website will continue working normally"
echo ""

read -p "Continue with DKIM record setup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "🎯 DNS RECORD ADDITION INSTRUCTIONS"
echo "==================================="
echo ""
echo "Add this TXT record to your DNS settings:"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Record Type:${NC} TXT"
echo -e "${BLUE}Host/Name:${NC}   $DKIM_HOST"
echo -e "${BLUE}Value:${NC}"
echo "$DKIM_VALUE"
echo -e "${BLUE}TTL:${NC}         3600 (or Auto)"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Instructions for different DNS providers
echo "📋 PROVIDER-SPECIFIC INSTRUCTIONS"
echo "---------------------------------"
echo ""
echo "🔹 VERCEL DNS (Recommended):"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your project → Settings → Domains"
echo "3. Find '$DOMAIN' → Edit → DNS Records"
echo "4. Click 'Add Record'"
echo "5. Type: TXT"
echo "6. Name: $DKIM_HOST"
echo "7. Value: [paste the long value above]"
echo "8. TTL: 3600"
echo "9. Click 'Save'"
echo ""

echo "🔹 CLOUDFLARE:"
echo "1. Go to Cloudflare Dashboard"
echo "2. Select domain → DNS → Records"
echo "3. Add Record → TXT"
echo "4. Name: $DKIM_HOST"
echo "5. Content: [paste the value]"
echo "6. Proxy: DNS only (grey cloud)"
echo ""

echo "🔹 OTHER PROVIDERS:"
echo "Look for 'DNS Management', 'DNS Records', or 'Advanced DNS'"
echo "Add a TXT record with the name and value shown above"
echo ""

# Create a verification script
echo "🔧 VERIFICATION SCRIPT"
echo "----------------------"

cat > "verify-dkim-record.sh" << 'EOF'
#!/bin/bash

DOMAIN="dubsthecreator.com"
DKIM_HOST="google._domainkey"

echo "🔍 Verifying DKIM Record Addition"
echo "================================="
echo ""

# Function to check DKIM record
check_dkim() {
    echo -n "Checking DKIM record... "
    if command -v dig >/dev/null 2>&1; then
        DKIM_RESULT=$(dig +short "$DKIM_HOST.$DOMAIN" TXT 2>/dev/null | tr -d '"')
        if [[ -n "$DKIM_RESULT" ]]; then
            echo "✅ DKIM record found!"
            echo ""
            echo "Record content:"
            echo "$DKIM_RESULT"
            echo ""
            
            # Check if it's the expected Google DKIM
            if [[ "$DKIM_RESULT" == *"v=DKIM1"* && "$DKIM_RESULT" == *"k=rsa"* ]]; then
                echo "✅ Valid Google DKIM format detected"
                return 0
            else
                echo "⚠️  Record found but format unexpected"
                return 1
            fi
        else
            echo "❌ No DKIM record found yet"
            echo ""
            echo "This could mean:"
            echo "• DNS changes haven't propagated yet (wait 5-60 minutes)"
            echo "• Record wasn't added correctly"
            echo "• DNS cache needs time to update"
            return 1
        fi
    else
        echo "❌ dig command not available for verification"
        return 1
    fi
}

# Check multiple DNS servers
echo "🌍 Checking DNS propagation:"
echo ""

DNS_SERVERS=("8.8.8.8" "1.1.1.1" "208.67.222.222")
for server in "${DNS_SERVERS[@]}"; do
    echo -n "  $server: "
    result=$(dig +short @$server "$DKIM_HOST.$DOMAIN" TXT 2>/dev/null | tr -d '"' | head -1)
    if [[ -n "$result" ]]; then
        echo "✅ Found"
    else
        echo "❌ Not found"
    fi
done

echo ""
check_dkim

echo ""
echo "🔄 If record not found:"
echo "• Wait 5-60 minutes for DNS propagation"
echo "• Run this script again: ./verify-dkim-record.sh"
echo "• Double-check the DNS record was added correctly"
EOF

chmod +x "verify-dkim-record.sh"

echo ""
echo "✅ Verification script created: verify-dkim-record.sh"
echo ""

# Final summary
echo "📋 NEXT STEPS"
echo "============="
echo ""
echo "1. ➕ Add the TXT record using instructions above"
echo "2. ⏱️  Wait 5-60 minutes for DNS propagation"  
echo "3. ✅ Run verification: ./verify-dkim-record.sh"
echo "4. 📧 Test email authentication in Gmail"
echo ""

echo "🔒 SAFETY REMINDERS:"
echo "• This only adds email security - won't affect website"
echo "• Your website will continue working normally"
echo "• You can remove this record anytime if needed"
echo "• Changes are fully reversible"
echo ""

echo "📞 Need help? Check GMAIL-VERCEL-SETUP.md for full context"
echo ""
echo "🎉 Ready to add your Gmail DKIM record safely!"