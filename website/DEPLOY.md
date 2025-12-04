# DXLStudio.ai Deployment Guide

## Files Ready
- `website/index.html` - Landing page with neural network branding

## Step 1: DNS Setup (Spaceship)
1. Log into Spaceship.com
2. Go to Domain → DXLStudio.ai → DNS Settings
3. Add A record: `@` → [Your IONOS VPS IP]
4. Add A record: `www` → [Your IONOS VPS IP]

## Step 2: VPS Setup (IONOS)
1. RDP into your Windows VPS
2. Open Server Manager → Add Roles → Web Server (IIS)
3. Open IIS Manager → Sites → Add Website
   - Site name: `dxlstudio`
   - Physical path: `C:\inetpub\wwwroot\dxlstudio`
   - Host name: `dxlstudio.ai` and `www.dxlstudio.ai`

## Step 3: Deploy
1. Copy `website/index.html` to `C:\inetpub\wwwroot\dxlstudio`
2. Rename to `index.html` if needed
3. Test: Visit http://[YOUR-VPS-IP]

## Step 4: SSL Certificate
1. Download win-acme from https://www.win-acme.com/
2. Run as Administrator
3. Follow prompts to get Let's Encrypt cert for dxlstudio.ai

## Your VPS IP
Fill in when you have it: _______________
