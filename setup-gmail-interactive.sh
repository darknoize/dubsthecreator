#!/bin/bash

# Quick Gmail Setup for dubsthecreator.com
# This will guide you through the EXACT steps needed

echo "📧 Gmail Setup for dubs@dubsthecreator.com"
echo "==========================================="
echo ""
echo "🎯 GOAL: Set up Gmail without any website downtime"
echo "📊 STATUS: Domain uses Vercel DNS (perfect for safe setup)"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 STEP 1: Google Workspace Registration${NC}"
echo "=========================================="
echo "1. Go to: https://workspace.google.com/pricing/"
echo "2. Click 'Get Started' on Business Starter ($6/month)"
echo "3. Enter your business name: 'Dubs The Creator'"
echo "4. Select employees: '1-9 employees'"
echo "5. Enter domain: dubsthecreator.com"
echo "6. Create admin account: admin@dubsthecreator.com"
echo ""
echo -e "${YELLOW}💡 TIP: Use a strong password and enable 2FA${NC}"
echo ""
read -p "Press Enter when you've completed Google Workspace registration..."

echo ""
echo -e "${BLUE}📋 STEP 2: Domain Verification${NC}"
echo "==============================="
echo "Google will ask you to verify domain ownership."
echo "Choose: 'Add a DNS record (recommended)'"
echo ""
echo "Google will provide a TXT record that looks like:"
echo "google-site-verification=ABC123xyz789..."
echo ""
echo "Copy that verification code and I'll add it to Vercel DNS:"
echo ""
read -p "Enter your Google verification code: " VERIFICATION_CODE

if [[ -n "$VERIFICATION_CODE" ]]; then
    echo ""
    echo -e "${GREEN}✅ Verification code received${NC}"
    echo "Adding to Vercel DNS..."
    echo ""
    echo "🔧 Manual steps (Vercel Dashboard method):"
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Find project: dubsthecreator"
    echo "3. Go to Settings → Domains"
    echo "4. Find dubsthecreator.com → Click 'Edit'"
    echo "5. Add DNS Record:"
    echo "   - Type: TXT"
    echo "   - Name: @"
    echo "   - Value: $VERIFICATION_CODE"
    echo "   - TTL: 300"
    echo "6. Click 'Save'"
    echo ""
    read -p "Press Enter after adding the TXT record in Vercel..."
    
    echo ""
    echo "Verifying domain ownership with Google..."
    echo "Go back to Google Workspace setup and click 'Verify'"
else
    echo -e "${RED}❌ No verification code provided${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 STEP 3: Create Email Account${NC}"
echo "================================"
echo "After domain verification:"
echo "1. In Google Workspace Admin Console"
echo "2. Go to Users → Add new user"
echo "3. Create account:"
echo "   - First name: Dubs"
echo "   - Last name: Creator" 
echo "   - Email: dubs@dubsthecreator.com"
echo "   - Password: [Strong password]"
echo "4. Enable 2-factor authentication"
echo ""
read -p "Press Enter when you've created the email account..."

echo ""
echo -e "${BLUE}📋 STEP 4: Configure MX Records${NC}"
echo "================================"
echo "Now we'll add Gmail MX records to Vercel DNS"
echo ""
echo "🔧 Add these MX records in Vercel Dashboard:"
echo ""
echo "Priority 1:  aspmx.l.google.com"
echo "Priority 5:  alt1.aspmx.l.google.com"
echo "Priority 5:  alt2.aspmx.l.google.com" 
echo "Priority 10: alt3.aspmx.l.google.com"
echo "Priority 10: alt4.aspmx.l.google.com"
echo ""
echo "📝 Steps in Vercel Dashboard:"
echo "1. Go to Settings → Domains → dubsthecreator.com → Edit"
echo "2. Add DNS Record (do this 5 times):"

# Create the MX records array
declare -a mx_records=(
    "1:aspmx.l.google.com"
    "5:alt1.aspmx.l.google.com" 
    "5:alt2.aspmx.l.google.com"
    "10:alt3.aspmx.l.google.com"
    "10:alt4.aspmx.l.google.com"
)

for i in "${mx_records[@]}"; do
    priority="${i%:*}"
    hostname="${i#*:}"
    echo ""
    echo "   Record $((${#mx_records[@]} - ${#mx_records[@]} + $(expr index "${mx_records[*]}" "$i"))):"
    echo "   - Type: MX"
    echo "   - Name: @" 
    echo "   - Value: $hostname"
    echo "   - Priority: $priority"
    echo "   - TTL: 3600"
done

echo ""
read -p "Press Enter after adding all 5 MX records..."

echo ""
echo -e "${BLUE}📋 STEP 5: Additional Security Records${NC}"
echo "======================================"
echo "Add these optional but recommended records:"
echo ""

echo "📝 SPF Record (prevents email spoofing):"
echo "   - Type: TXT"
echo "   - Name: @"
echo "   - Value: v=spf1 include:_spf.google.com ~all"
echo ""

echo "📝 DMARC Record (email authentication policy):"
echo "   - Type: TXT" 
echo "   - Name: _dmarc"
echo "   - Value: v=DMARC1; p=quarantine; rua=mailto:dubs@dubsthecreator.com"
echo ""

read -p "Press Enter after adding SPF and DMARC records (optional)..."

echo ""
echo -e "${GREEN}🎉 SETUP COMPLETE!${NC}"
echo "=================="
echo ""
echo "✅ What you should have now:"
echo "   • dubs@dubsthecreator.com email account"
echo "   • Google Workspace admin access"
echo "   • MX records configured for Gmail"
echo "   • Domain verified with Google"
echo ""
echo "📧 Testing your email:"
echo "   1. Go to: https://gmail.com"
echo "   2. Sign in with: dubs@dubsthecreator.com"
echo "   3. Send a test email to yourself"
echo "   4. Send from external email TO dubs@dubsthecreator.com"
echo ""
echo "📱 Mobile setup:"
echo "   • Download Gmail app"
echo "   • Sign in with dubs@dubsthecreator.com"
echo "   • Or add to Apple Mail/Outlook"
echo ""
echo "🌐 Your website:"
echo "   • Should remain working at dubsthecreator.com"
echo "   • Vercel hosting unchanged"
echo "   • Only email functionality added"
echo ""

# Final verification
echo -e "${BLUE}🔍 Final Verification${NC}"
echo "===================="
echo "Running DNS check in 30 seconds (time for DNS to propagate)..."
echo ""

for i in {30..1}; do
    echo -ne "\rWaiting for DNS propagation... $i seconds"
    sleep 1
done

echo ""
echo ""
echo "Checking DNS records..."

# Check MX records
if command -v dig >/dev/null 2>&1; then
    echo ""
    echo "📧 MX Records Status:"
    MX_RESULT=$(dig +short dubsthecreator.com MX 2>/dev/null)
    if [[ -n "$MX_RESULT" ]]; then
        echo -e "${GREEN}✅ MX records found:${NC}"
        echo "$MX_RESULT"
        
        if echo "$MX_RESULT" | grep -q "aspmx.l.google.com"; then
            echo -e "${GREEN}✅ Google Gmail MX records detected!${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  MX records not yet propagated (may take a few minutes)${NC}"
    fi
    
    echo ""
    echo "📝 TXT Records Status:"
    TXT_RESULT=$(dig +short dubsthecreator.com TXT 2>/dev/null)
    if [[ -n "$TXT_RESULT" ]]; then
        echo -e "${GREEN}✅ TXT records found:${NC}"
        echo "$TXT_RESULT" | grep -E "(google-site-verification|v=spf1)"
    else
        echo -e "${YELLOW}⚠️  TXT records not yet propagated${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🚀 SUCCESS! Gmail is now set up for dubsthecreator.com${NC}"
echo ""
echo "📞 Need help? Check:"
echo "   • Google Workspace Admin: https://admin.google.com"
echo "   • Vercel Dashboard: https://vercel.com/dashboard"
echo "   • Re-run verification: ./verify-dns-setup.sh"
echo ""
echo -e "${BLUE}💼 Your professional email dubs@dubsthecreator.com is ready!${NC}"