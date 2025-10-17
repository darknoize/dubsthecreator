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
