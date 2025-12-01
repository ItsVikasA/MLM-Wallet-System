# MongoDB Setup Guide - URGENT FIX

## Issue
Your MongoDB Atlas cluster is not accessible because your IP address is not whitelisted.

---

## SOLUTION 1: Whitelist IP in MongoDB Atlas (RECOMMENDED FOR CLIENT DEMO)

### Steps:
1. Go to https://cloud.mongodb.com/
2. Login with your credentials
3. Select your project
4. Click on "Network Access" in the left sidebar
5. Click "Add IP Address" button
6. Choose one of these options:

   **Option A: Allow from Anywhere (Quick Demo)**
   - Click "Allow Access from Anywhere"
   - This adds 0.0.0.0/0 to whitelist
   - ⚠️ Use only for development/demo
   - Click "Confirm"

   **Option B: Add Current IP (More Secure)**
   - Click "Add Current IP Address"
   - Your current IP will be detected automatically
   - Click "Confirm"

7. Wait 1-2 minutes for changes to propagate
8. Restart your application: `npm run dev`

---

## SOLUTION 2: Use Local MongoDB (BACKUP OPTION)

If you can't access MongoDB Atlas right now, use local MongoDB:

### Install MongoDB Locally:

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. MongoDB will run on `mongodb://localhost:27017`

**Mac (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Update .env.local:
```env
# Use local MongoDB instead
MONGODB_URI=mongodb://localhost:27017/mlm-wallet-system

# Keep other settings
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=mlm-secret-key-2024-production-ready
MIN_WITHDRAWAL_AMOUNT=100
COMMISSION_RATE=0.10
```

### Seed Initial Data:
```bash
npm run seed
```

---

## SOLUTION 3: Quick MongoDB Atlas Connection String Fix

Sometimes the connection string format needs adjustment:

### Try this updated connection string in .env.local:
```env
MONGODB_URI=mongodb+srv://mlm:mlm@cluster0.mkhw5hh.mongodb.net/mlm-wallet-system?retryWrites=true&w=majority
```

---

## Verify Connection

After applying any solution, test the connection:

1. Restart the server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. Try to register a new account
3. Check console for "✅ MongoDB connected successfully"

---

## For Client Delivery TODAY

**FASTEST SOLUTION:**
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Click "Allow Access from Anywhere"
4. Wait 2 minutes
5. Restart app: `npm run dev`
6. Test registration

**Time Required:** 5 minutes

---

## Current Error Explained

```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

This means:
- ✅ Your MongoDB URI is correct
- ✅ Your credentials are correct
- ❌ Your IP address is blocked by MongoDB Atlas firewall

---

## After Fixing

You should see:
```
✅ MongoDB connected successfully
```

And registration will work!

---

## Need Help?

If issues persist:
1. Check MongoDB Atlas status: https://status.mongodb.com/
2. Verify your cluster is running
3. Check your MongoDB Atlas credentials
4. Try the connection string with added parameters (Solution 3)

---

## Production Deployment

For production:
- ✅ Use specific IP addresses (not 0.0.0.0/0)
- ✅ Use MongoDB Atlas with proper security
- ✅ Enable authentication
- ✅ Use environment variables
- ✅ Set up monitoring
