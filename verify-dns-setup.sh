#!/bin/bash

# Gmail + Vercel DNS Setup Verification Script
# Safe monitoring without making any changes

set -e

DOMAIN="dubsthecreator.com"
EMAIL="dubs@dubsthecreator.com"

echo "🔍 DNS Setup Verification for $DOMAIN"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to test HTTP response
test_website() {
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$1" 2>/dev/null || echo "000")
    if [[ $status_code == "200" ]]; then
        echo -e "${GREEN}✅ Website responding (HTTP $status_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ Website issue (HTTP $status_code)${NC}"
        return 1
    fi
}

echo "🌐 WEBSITE STATUS CHECK"
echo "----------------------"
echo -n "Testing $DOMAIN... "
if test_website "https://$DOMAIN"; then
    echo -e "${GREEN}Website is working properly${NC}"
else
    echo -e "${YELLOW}Checking HTTP fallback...${NC}"
    if test_website "http://$DOMAIN"; then
        echo -e "${YELLOW}⚠️  HTTP works, HTTPS might need attention${NC}"
    else
        echo -e "${RED}❌ Website not responding${NC}"
    fi
fi

echo ""

echo "🔍 CURRENT DNS RECORDS"
echo "----------------------"

# Check A records (website hosting)
echo "📍 A Records (Website hosting):"
if command_exists dig; then
    A_RECORDS=$(dig +short $DOMAIN A 2>/dev/null || echo "No records found")
    if [[ -n "$A_RECORDS" && "$A_RECORDS" != "No records found" ]]; then
        echo -e "${GREEN}✅ A Records found:${NC}"
        echo "$A_RECORDS" | while read -r record; do
            echo "   → $record"
        done
    else
        echo -e "${RED}❌ No A records found${NC}"
    fi
else
    echo "⚠️  dig command not available"
fi

echo ""

# Check CNAME records
echo "🔗 CNAME Records:"
if command_exists dig; then
    CNAME_RECORDS=$(dig +short $DOMAIN CNAME 2>/dev/null || echo "")
    if [[ -n "$CNAME_RECORDS" ]]; then
        echo -e "${GREEN}✅ CNAME Records:${NC}"
        echo "$CNAME_RECORDS" | while read -r record; do
            echo "   → $record"
        done
    else
        echo "ℹ️  No CNAME records (normal for A record setup)"
    fi
fi

echo ""

# Check MX records (email)
echo "📧 MX Records (Email hosting):"
if command_exists dig; then
    MX_RECORDS=$(dig +short $DOMAIN MX 2>/dev/null || echo "")
    if [[ -n "$MX_RECORDS" ]]; then
        echo -e "${GREEN}✅ MX Records found:${NC}"
        echo "$MX_RECORDS" | while read -r record; do
            echo "   → $record"
        done
        
        # Check if Google MX records are present
        if echo "$MX_RECORDS" | grep -q "aspmx.l.google.com"; then
            echo -e "${GREEN}✅ Google Workspace MX records detected${NC}"
        else
            echo -e "${YELLOW}⚠️  Non-Google MX records found${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No MX records found - Email not configured${NC}"
    fi
fi

echo ""

# Check TXT records (verification, SPF, DMARC)
echo "📝 TXT Records (Verification & Email security):"
if command_exists dig; then
    TXT_RECORDS=$(dig +short $DOMAIN TXT 2>/dev/null | tr -d '"' || echo "")
    if [[ -n "$TXT_RECORDS" ]]; then
        echo -e "${GREEN}✅ TXT Records found:${NC}"
        echo "$TXT_RECORDS" | while read -r record; do
            if [[ -n "$record" ]]; then
                case "$record" in
                    *google-site-verification*)
                        echo -e "   ${GREEN}✅ Google verification: $record${NC}"
                        ;;
                    *v=spf1*)
                        echo -e "   ${GREEN}✅ SPF record: $record${NC}"
                        ;;
                    *v=DMARC1*)
                        echo -e "   ${GREEN}✅ DMARC record: $record${NC}"
                        ;;
                    *)
                        echo -e "   ℹ️  Other TXT: $record"
                        ;;
                esac
            fi
        done
    else
        echo -e "${YELLOW}⚠️  No TXT records found${NC}"
    fi
fi

echo ""

# Check nameservers
echo "🌐 Nameservers:"
if command_exists dig; then
    NS_RECORDS=$(dig +short $DOMAIN NS 2>/dev/null || echo "")
    if [[ -n "$NS_RECORDS" ]]; then
        echo -e "${GREEN}✅ Nameservers:${NC}"
        echo "$NS_RECORDS" | while read -r record; do
            echo "   → $record"
            if [[ "$record" == *"vercel-dns.com"* ]]; then
                echo -e "     ${GREEN}✅ Vercel DNS detected${NC}"
            fi
        done
    else
        echo -e "${RED}❌ No nameservers found${NC}"
    fi
fi

echo ""

# Email delivery test (if MX records exist)
echo "📬 EMAIL DELIVERY TEST"
echo "----------------------"
if command_exists dig; then
    MX_CHECK=$(dig +short $DOMAIN MX 2>/dev/null || echo "")
    if [[ -n "$MX_CHECK" ]]; then
        echo -e "${BLUE}📧 Email configuration detected${NC}"
        echo "To test email delivery:"
        echo "1. Send test email TO: $EMAIL"
        echo "2. Check if email arrives in inbox"
        echo "3. Send test email FROM: $EMAIL"
        echo "4. Verify delivery to external address"
        
        # Check if this is Google Workspace
        if echo "$MX_CHECK" | grep -q "google.com"; then
            echo ""
            echo -e "${GREEN}✅ Google Workspace MX records detected${NC}"
            echo "📱 Gmail setup: https://gmail.com"
            echo "📱 Mobile apps: Gmail app (iOS/Android)"
        fi
    else
        echo -e "${YELLOW}⚠️  No email configuration found${NC}"
        echo "Email setup needed - see GMAIL-VERCEL-SETUP.md"
    fi
fi

echo ""

# Vercel integration check
echo "⚡ VERCEL INTEGRATION"
echo "--------------------"
if command_exists vercel; then
    echo -n "Checking Vercel CLI status... "
    if vercel whoami >/dev/null 2>&1; then
        VERCEL_USER=$(vercel whoami 2>/dev/null)
        echo -e "${GREEN}✅ Authenticated as: $VERCEL_USER${NC}"
        
        # Check recent deployments
        echo ""
        echo "Recent deployments:"
        vercel ls --scope buzz-corp 2>/dev/null | head -3 | tail -2 || echo "No recent deployments found"
    else
        echo -e "${YELLOW}⚠️  Not authenticated${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
fi

echo ""

# DNS propagation check
echo "🌍 DNS PROPAGATION STATUS"
echo "------------------------"
echo "Checking DNS propagation worldwide..."

# Function to check DNS from multiple servers
check_dns_propagation() {
    local servers=("8.8.8.8" "1.1.1.1" "208.67.222.222")
    local record_type="$1"
    local expected="$2"
    
    echo "Checking $record_type records:"
    for server in "${servers[@]}"; do
        echo -n "  $server: "
        if command_exists dig; then
            result=$(dig +short @$server $DOMAIN $record_type 2>/dev/null | head -1)
            if [[ -n "$result" ]]; then
                if [[ "$result" == *"$expected"* ]] || [[ -z "$expected" ]]; then
                    echo -e "${GREEN}✅ $result${NC}"
                else
                    echo -e "${YELLOW}⚠️  $result (expected: $expected)${NC}"
                fi
            else
                echo -e "${RED}❌ No response${NC}"
            fi
        else
            echo "dig not available"
        fi
    done
}

# Check propagation for key records
check_dns_propagation "A" "216.150"
echo ""
if [[ -n "$(dig +short $DOMAIN MX 2>/dev/null)" ]]; then
    check_dns_propagation "MX" "google.com"
fi

echo ""
echo "🏁 SETUP SUMMARY"
echo "================"

# Overall status
WEBSITE_OK=false
EMAIL_CONFIGURED=false
VERCEL_OK=false

# Check website
if test_website "https://$DOMAIN" >/dev/null 2>&1; then
    WEBSITE_OK=true
fi

# Check email
if command_exists dig && [[ -n "$(dig +short $DOMAIN MX 2>/dev/null)" ]]; then
    EMAIL_CONFIGURED=true
fi

# Check Vercel
if command_exists vercel && vercel whoami >/dev/null 2>&1; then
    VERCEL_OK=true
fi

# Print summary
echo -n "Website Status: "
if $WEBSITE_OK; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Issues detected${NC}"
fi

echo -n "Email Status: "
if $EMAIL_CONFIGURED; then
    echo -e "${GREEN}✅ Configured${NC}"
else
    echo -e "${YELLOW}⚠️  Needs setup${NC}"
fi

echo -n "Vercel Status: "
if $VERCEL_OK; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${YELLOW}⚠️  Check connection${NC}"
fi

echo ""
echo "📚 Next Steps:"
if ! $EMAIL_CONFIGURED; then
    echo "1. 📧 Set up Gmail: See GMAIL-VERCEL-SETUP.md"
fi
if ! $WEBSITE_OK; then
    echo "2. 🌐 Check website deployment in Vercel dashboard"
fi
echo "3. 🔄 Run this script again after making changes"
echo ""
echo "📖 Full setup guide: GMAIL-VERCEL-SETUP.md"
echo "🔍 Re-run check: ./verify-dns-setup.sh"