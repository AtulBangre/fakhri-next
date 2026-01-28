# Git Setup Instructions - Fakhri IT Services

## Issue
There is a corrupted `.git` folder with permission issues that prevents initializing the repository.

## Solution: Manual Steps Required

### Step 1: Fix the .git Permission Issue

**Option A: Using File Explorer (Easiest)**
1. Close VS Code completely
2. Open File Explorer
3. Navigate to: `G:\Project\Maurya technologies\fakhri-it-services`
4. Click "View" → Check "Hidden items"
5. Find the `.git` folder (it should be visible now)
6. Right-click `.git` → Delete (or Shift+Delete for permanent deletion)
7. If deletion fails, restart your computer and try again

**Option B: Using Command Prompt as Administrator**
1. Press Win+X → Select "Terminal (Admin)" or "PowerShell (Admin)"
2. Run these commands:
```cmd
cd "G:\Project\Maurya technologies\fakhri-it-services"
takeown /f .git /r /d y
icacls .git /grant %username%:F /t
rd /s /q .git
```

### Step 2: Initialize Git Repository

After successfully removing the `.git` folder, open a new terminal in VS Code and run:

```bash
# Initialize new Git repository
git init

# Configure Git (if not already done)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Complete Next.js Fakhri IT Services website"

# Rename branch to main
git branch -M main

# Add remote repository
git remote add origin https://github.com/AtulBangre/fakhri-next.git

# Push to GitHub
git push -u origin main
```

### Step 3: Alternative - Quick Commands

If you just want to push with minimal setup:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/AtulBangre/fakhri-next.git
git push -u origin main
```

### Step 4: If Push Fails Due to Existing Repository

If the GitHub repository already has content, you might need to force push:

```bash
git push -u origin main --force
```

⚠️ **Warning**: This will overwrite any existing content in the GitHub repository.

### Step 5: Verify Upload

After pushing, verify at: https://github.com/AtulBangre/fakhri-next

---

## Project Files Included

✅ Complete Next.js application
✅ All components and pages
✅ Blog system with individual post pages
✅ Pricing page with comparison
✅ Contact and Within 2 Hours service pages
✅ Responsive design and animations
✅ All data files and configurations

## What's in .gitignore

The following are excluded from Git:
- `node_modules/` - Dependencies
- `.next/` - Build output
- `.env*.local` - Environment variables
- `*.log` - Log files
- `.DS_Store` - Mac system files

---

## Troubleshooting

**If you get authentication errors:**
- Make sure you're logged into GitHub
- Use a Personal Access Token instead of password
- Or use GitHub Desktop to push

**If the repository doesn't exist:**
- Create it first at https://github.com/new
- Name it exactly: `fakhri-next`
- Don't initialize with README (we already have one)

---

## Quick Reference

**Repository URL**: https://github.com/AtulBangre/fakhri-next.git
**Branch**: main
**Initial Commit**: "first commit" or "Initial commit: Complete Next.js Fakhri IT Services website"
