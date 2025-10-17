# Gmail DKIM DNS Record for dubsthecreator.com

## Record Details
**Type:** TXT
**Host/Name:** google._domainkey
**Value:** v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsce9Dj/VIeTI8bHOEq2taB7Jb0+A6BamlzXL1W8NBRG2JC2HmFT8ZOzgCZghaJBzwNwW76wAExlKyQfQeODsgZb+cVdAyKa2H3IrSmITifaaaK486ei2ldU/ezxx2QUL7h6vMM49ti88zu2kA+xEXz59zLs0M4M1tci99vj14yYNghwfYNhiSU4nxL0maCMVkk9d8+KVKMrtweOwai6fCO+fKu4+MUbZMtgKq3nzmKEZgWANtq0wh3Sn5q+deQLYdclMLBs2/GVtoYXMHbNk/bd1ez/ZNrhYcrUq0QUOtkxClSuDJlpQSNg1nIWU48frKq6V+OwsFmi3CYOuFXbmgwIDAQAB
**TTL:** 3600 (1 hour)

## What This Does
- Enables Gmail DKIM email authentication
- Improves email deliverability and security
- Prevents email spoofing
- Required for professional Gmail setup

## Safety Notes
✅ **SAFE to add** - This TXT record:
- Won't affect your website hosting
- Won't interfere with existing DNS records
- Can be removed easily if needed
- Only impacts email authentication

## How to Add

### Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Domains
3. Find `dubsthecreator.com` → Edit → DNS Records
4. Click "Add Record"
5. Type: **TXT**
6. Name: **google._domainkey**
7. Value: **[paste the long value above]**
8. TTL: **3600**
9. Click "Save"

### Via Vercel CLI (Alternative)
```bash
vercel dns add dubsthecreator.com google._domainkey TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsce9Dj/VIeTI8bHOEq2taB7Jb0+A6BamlzXL1W8NBRG2JC2HmFT8ZOzgCZghaJBzwNwW76wAExlKyQfQeODsgZb+cVdAyKa2H3IrSmITifaaaK486ei2ldU/ezxx2QUL7h6vMM49ti88zu2kA+xEXz59zLs0M4M1tci99vj14yYNghwfYNhiSU4nxL0maCMVkk9d8+KVKMrtweOwai6fCO+fKu4+MUbZMtgKq3nzmKEZgWANtq0wh3Sn5q+deQLYdclMLBs2/GVtoYXMHbNk/bd1ez/ZNrhYcrUq0QUOtkxClSuDJlpQSNg1nIWU48frKq6V+OwsFmi3CYOuFXbmgwIDAQAB"
```

## Verification
After adding, wait 5-60 minutes then run:
```bash
./verify-dkim-record.sh
```

Or check manually:
```bash
dig google._domainkey.dubsthecreator.com TXT +short
```

## Troubleshooting
- **Record not found**: Wait longer for DNS propagation (up to 24 hours)
- **Website issues**: This record won't cause website problems - check other DNS records
- **Email issues**: Ensure MX records are also properly configured

## Related Files
- `add-gmail-dkim-record.sh` - Interactive setup script
- `verify-dkim-record.sh` - Verification script (auto-generated)
- `GMAIL-VERCEL-SETUP.md` - Complete Gmail setup guide