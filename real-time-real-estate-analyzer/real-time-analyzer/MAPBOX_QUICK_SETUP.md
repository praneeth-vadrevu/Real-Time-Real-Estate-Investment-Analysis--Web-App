# Mapbox Quick Setup Guide

## 🚀 Quick Steps to Get Your Mapbox Token

### Step 1: Get Your Mapbox Access Token

1. **Go to Mapbox**: Open https://account.mapbox.com/access-tokens/ in your browser
2. **Sign Up/Login**: 
   - If you don't have an account, click "Sign up" (it's free!)
   - Free tier includes 50,000 map loads per month
3. **Get Your Token**:
   - Once logged in, you'll see your **Default Public Token**
   - It will look like: `pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImN...`
   - Click the copy button or manually copy the entire token

### Step 2: Update Your .env File

**Option A: Edit manually**
1. Open the file: `real-time-real-estate-analyzer/real-time-analyzer/.env`
2. Find the line: `REACT_APP_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token-here`
3. Replace `your-mapbox-access-token-here` with your actual token
4. Save the file

**Option B: Use terminal (if you have the token ready)**
```bash
cd real-time-real-estate-analyzer/real-time-analyzer
# Replace YOUR_TOKEN_HERE with your actual token
echo "REACT_APP_MAPBOX_ACCESS_TOKEN=YOUR_TOKEN_HERE" > .env
```

### Step 3: Restart Your React Server

**Important:** Environment variables are only loaded when the server starts!

1. Stop the current server: Press `Ctrl+C` in the terminal
2. Start it again:
   ```bash
   cd real-time-real-estate-analyzer/real-time-analyzer
   npm start
   ```

### Step 4: Verify It Works

After restarting:
- The error message should disappear
- You should see the Mapbox map load
- The search box should appear in the top-right corner

## 📝 Example .env File

Your `.env` file should look like this (with your actual token):

```
REACT_APP_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImN...your-actual-token
```

**⚠️ Important:**
- NO quotes around the token
- NO spaces around the `=` sign
- The token should start with `pk.eyJ...`

## 🔍 Troubleshooting

**Still seeing the error?**
1. ✅ Make sure you saved the .env file
2. ✅ Make sure you restarted the server (Ctrl+C then npm start)
3. ✅ Check the token doesn't have quotes: `REACT_APP_MAPBOX_ACCESS_TOKEN="token"` ❌
4. ✅ Check the token is correct: Should start with `pk.eyJ...`
5. ✅ Check the file location: `real-time-real-estate-analyzer/real-time-analyzer/.env`

**Token format issues?**
- ❌ Wrong: `REACT_APP_MAPBOX_ACCESS_TOKEN="pk.eyJ..."`
- ❌ Wrong: `REACT_APP_MAPBOX_ACCESS_TOKEN = pk.eyJ...`
- ✅ Correct: `REACT_APP_MAPBOX_ACCESS_TOKEN=pk.eyJ...`

## 🆘 Need Help?

If you're having trouble:
1. Check the browser console for detailed error messages
2. Verify your token is active in your Mapbox account
3. Make sure you're using a **Public Token** (starts with `pk.`)

