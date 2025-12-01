# Available Routes - MLM Wallet System

## 🌐 Application Routes

### Public Routes (No Login Required)
- **/** - Home page
  - http://localhost:3000/
  
- **/login** - Login page
  - http://localhost:3000/login
  
- **/register** - Registration page
  - http://localhost:3000/register

---

### Protected Routes (Login Required)

#### Main Navigation

1. **/dashboard** - Main dashboard
   - http://localhost:3000/dashboard
   - Shows wallet balances, recent transactions, active package
   
2. **/wallets** - Wallet management & transactions
   - http://localhost:3000/wallets
   - View both wallets
   - Deposit to main wallet
   - Withdraw from commission wallet
   - **Transaction history is here!** ✅
   - Filter transactions by date, type, wallet
   - Export to CSV
   
3. **/genealogy** - Genealogy tree
   - http://localhost:3000/genealogy
   - View binary tree structure
   - See downline members
   - Navigate tree
   
4. **/packages** - Package management
   - http://localhost:3000/packages
   - View available packages
   - Purchase packages
   - See active package
   
5. **/commissions** - Commission tracking
   - http://localhost:3000/commissions
   - View commission summary
   - See leg volumes
   - Track pairing history
   
6. **/profile** - User profile
   - http://localhost:3000/profile
   - View member information
   - See sponsor details
   - View statistics
   
7. **/settings** - Account settings
   - http://localhost:3000/settings
   - Change password
   - Update preferences

---

## 📍 Important Notes

### Transaction History
**There is NO `/transactions` route!**

Transactions are accessed through:
- **/wallets** page - Full transaction history with filters
- **/dashboard** page - Recent 5 transactions

### Navigation
All pages have a sidebar menu with links to:
- Dashboard
- Wallets (includes transactions)
- Genealogy
- Packages
- Commissions
- Profile
- Settings

---

## 🔗 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/callback/credentials` - Login
- `GET /api/auth/session` - Get current session
- `GET /api/auth/providers` - Get auth providers
- `GET /api/auth/csrf` - Get CSRF token

### Wallets
- `GET /api/wallets` - Get both wallet balances
- `POST /api/wallets/deposit` - Deposit to main wallet
- `POST /api/wallets/withdraw` - Withdraw from commission wallet
- `GET /api/wallets/transactions` - Get transaction history

### Packages
- `GET /api/packages` - Get all packages
- `GET /api/packages/active` - Get active package
- `POST /api/packages/purchase` - Purchase package

### Genealogy
- `GET /api/genealogy/tree` - Get genealogy tree
- `GET /api/genealogy/downline` - Get downline members
- `GET /api/genealogy/upline` - Get upline members

### Commissions
- `GET /api/commissions/summary` - Get commission summary
- `GET /api/commissions/leg-volumes` - Get leg volumes
- `GET /api/commissions/history` - Get commission history

### Profile
- `GET /api/profile` - Get user profile

### Settings
- `POST /api/settings/password` - Change password

---

## 🎯 Quick Navigation Guide

### After Login, Go To:

1. **View Wallets & Transactions**
   → http://localhost:3000/wallets

2. **Make a Deposit**
   → http://localhost:3000/wallets
   → Click "Deposit" button

3. **View Genealogy Tree**
   → http://localhost:3000/genealogy

4. **Purchase Package**
   → http://localhost:3000/packages

5. **Check Commissions**
   → http://localhost:3000/commissions

6. **View Profile**
   → http://localhost:3000/profile

---

## 🔍 Finding Features

### "Where is the transaction history?"
→ **http://localhost:3000/wallets**
- Full transaction table
- Filters by date, type, wallet
- Export to CSV
- Pagination

### "Where can I deposit money?"
→ **http://localhost:3000/wallets**
- Click "Deposit" button on Main Wallet card
- Or use Dashboard quick action

### "Where can I withdraw?"
→ **http://localhost:3000/wallets**
- Click "Withdraw" button on Commission Wallet card

### "Where is my genealogy tree?"
→ **http://localhost:3000/genealogy**
- Interactive tree visualization
- Zoom and pan controls
- Member information cards

### "Where can I buy packages?"
→ **http://localhost:3000/packages**
- View all available packages
- Purchase with main wallet balance

---

## 📱 Mobile Navigation

On mobile devices:
1. Click hamburger menu (☰) in top-left
2. Select page from sidebar
3. Sidebar closes automatically after selection

---

## ✅ All Routes Tested

- [x] / (Home)
- [x] /login
- [x] /register
- [x] /dashboard
- [x] /wallets (includes transactions)
- [x] /genealogy
- [x] /packages
- [x] /commissions
- [x] /profile
- [x] /settings

---

## 🚫 Routes That Don't Exist

- ❌ /transactions (use /wallets instead)
- ❌ /admin (not implemented)
- ❌ /reports (not implemented)
- ❌ /analytics (not implemented)

---

## 💡 Pro Tips

1. **Sidebar Navigation**: Use the left sidebar to navigate between pages
2. **Transaction History**: Always in /wallets page
3. **Quick Actions**: Dashboard has quick action buttons
4. **Responsive**: Works on mobile, tablet, desktop
5. **Protected**: All main pages require login

---

**For full transaction history with filters, go to:**
## 👉 http://localhost:3000/wallets

This page includes:
- Both wallet balances
- Deposit button
- Withdraw button
- Complete transaction history
- Advanced filters
- CSV export
- Pagination

---

**Last Updated**: November 30, 2025
**Version**: 1.0.0
