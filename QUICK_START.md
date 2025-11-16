# 🚀 Quick Start Guide

Get the Truck Management System running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

The `.env` file is already created. You just need to update one value:

1. Get a DeepSeek API key from: https://platform.deepseek.com/api_keys
2. Open `.env` file
3. Replace `your-deepseek-api-key-here` with your actual API key

```env
DEEPSEEK_API_KEY=sk-your-actual-key-here
```

**Note:** The other values are already set for local development.

## Step 3: Run the Development Server

```bash
npm run dev
```

## Step 4: Open Your Browser

Go to: http://localhost:3000

## Step 5: Login with Test Account

**Use pre-configured test accounts for quick testing:**

**Truck Owner:**
- Email: `owner@test.com`
- Password: `Password123`

**Driver:**
- Email: `driver@test.com`
- Password: `Password123`

**Or create your own account:**
1. Click "Register now"
2. Fill in your details:
   - Name: Your Name
   - Email: your@email.com
   - Password: Must have uppercase, lowercase, and number (e.g., `Password123`)
   - Confirm Password: Same as above
   - Role: Choose "Truck Owner" or "Driver"
3. Click "Register"
4. Login with your credentials

## 🎉 You're Done!

### What to Try Next

**If you're a Truck Owner:**
1. Go to Fleet Management
2. Click "Generate Code To Add Fleet Member"
3. Register a truck
4. Create a checklist for drivers

**If you're a Driver:**
1. Get a fleet code from a truck owner
2. Enter it on the dashboard
3. Complete checklists
4. Try the AI chatbot

## 🐛 Having Issues?

### "Invalid email or password"
- Make sure you registered first
- Use the exact same email and password
- Data is stored in `data/users.json`

### Chatbot not working
- Check that your `DEEPSEEK_API_KEY` is valid
- Make sure you have API credits

### Build errors
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Run `npm run dev`

## 📚 Need More Help?

- See [README.md](./README.md) for full documentation
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Check the browser console for errors (F12)

---

Happy trucking! 🚛
