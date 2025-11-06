# GitHub Token Rotation Guide

## 🔒 Security Best Practice

GitHub Personal Access Tokens should be rotated every **90 days** for security.

---

## ⚡ Quick Token Rotation (30 seconds)

### Step 1: Revoke Old Token
1. Visit: https://github.com/settings/tokens
2. Find current token (check `.env` for reference)
3. Click **Delete** button
4. Confirm deletion

### Step 2: Generate New Token
1. Visit: https://github.com/settings/tokens/new
2. **Token name**: `VerdIQ-Development-[DATE]`
3. **Expiration**: 90 days
4. **Scopes** (minimal required):
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Click **Generate token**
6. **COPY TOKEN IMMEDIATELY** (you won't see it again!)

### Step 3: Update .env File
```bash
cd ~/projects/FactBenchV2

# Edit .env file
nano .env

# Update this line:
GITHUB_TOKEN=ghp_[YOUR_NEW_TOKEN_HERE]

# Save and exit (Ctrl+X, Y, Enter)

# Verify it's still ignored by Git
git status  # Should NOT show .env as modified
```

### Step 4: Test New Token
```bash
# Test push access (dry run)
cd ~/projects/FactBenchV2
git pull origin main

# If successful, token is working!
```

### Step 5: Update Rotation Date
```bash
# Edit .env file
nano .env

# Update these lines at the bottom:
# Current token created: [TODAY'S DATE]
# Next rotation due: [TODAY + 90 DAYS]
```

---

## 📅 Token Rotation Schedule

| Token Created | Rotation Due | Status |
|---------------|--------------|--------|
| 2024-11-06    | 2025-02-04   | ⏳ Active |

**Next Rotation**: 2025-02-04

---

## 🚨 Emergency Token Revocation

If token is compromised (exposed in chat, screenshot, email):

### Immediate Actions (DO NOW!)
```bash
# 1. Revoke token immediately
# Visit: https://github.com/settings/tokens
# Click Delete on compromised token

# 2. Generate new token (follow Step 2 above)

# 3. Update .env immediately
# Follow Step 3 above

# 4. Verify no sensitive data in recent commits
cd ~/projects/FactBenchV2
git log -5 --patch | grep -i "token\|secret\|password"

# 5. If found in commits, contact GitHub Support
# https://support.github.com/
```

---

## 🛡️ Token Security Checklist

- [ ] Token is stored in `.env` file only
- [ ] `.env` is in `.gitignore` (never committed)
- [ ] `.env` has 600 permissions (owner read/write only)
- [ ] Token has minimal required scopes (repo + workflow)
- [ ] Token expires in 90 days (not "No expiration")
- [ ] Token is never shared in chat, email, or screenshots
- [ ] Rotation reminder is set in calendar

---

## 📋 Token Permissions Required

### Minimal Scopes (Recommended)
- **repo**: Full control of repositories
  - Needed for: push, pull, clone private repos
- **workflow**: Update GitHub Actions workflows
  - Needed for: automated deployments

### NOT Required
- ❌ admin:org
- ❌ delete_repo
- ❌ admin:public_key
- ❌ admin:repo_hook
- ❌ gist
- ❌ notifications
- ❌ user
- ❌ write:packages

**Rule**: Only enable permissions you actively need!

---

## 🔍 Token Security Audit

### Monthly Check
```bash
# 1. Verify .env is gitignored
cd ~/projects/FactBenchV2
git check-ignore -v .env
# Should output: .gitignore:X:.env	.env

# 2. Check no secrets in recent commits
git log -10 --all --patch | grep -i "ghp_\|token\|secret"

# 3. Verify token still works
git pull origin main

# 4. Check token expiration
# Visit: https://github.com/settings/tokens
# Verify expiration date is within 90 days
```

---

## 📞 Need Help?

### Token Not Working?
- Verify correct scopes are enabled
- Check token isn't expired
- Ensure token is in `.env` without extra spaces
- Try regenerating token

### Token Exposed?
- **Revoke immediately** (don't wait!)
- Generate new token
- Update `.env`
- Document the incident

### Other Issues?
- Check GitHub Status: https://www.githubstatus.com/
- GitHub Support: https://support.github.com/

---

## ⏰ Rotation Reminder Setup

### Option 1: Calendar Reminder
- Add calendar event for 2025-02-04
- Title: "Rotate GitHub Token - FactBench VerdIQ"
- Set reminder 1 week before

### Option 2: Automated Reminder
```bash
# Add to crontab for email reminder
# Edit: crontab -e
# Add line (adjust date/email):
0 9 4 2 * echo "GitHub token rotation due today!" | mail -s "Token Rotation" your@email.com
```

---

**Last Updated**: 2024-11-06
**Next Review**: 2025-02-04
