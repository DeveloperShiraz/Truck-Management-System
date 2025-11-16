# Troubleshooting Guide

## Authentication Issues

### "Invalid email or password" Error

**Problem:** You're getting "Invalid email or password" even though you're certain your credentials are correct.

**Root Cause:** The application stores user data in browser **localStorage**, which is:
- Specific to each browser
- Specific to each device
- Cleared when you clear browser data
- Not shared between different browsers or incognito/private windows

**Solutions:**

1. **Use the same browser where you registered**
   - If you registered in Chrome, login in Chrome
   - If you registered in Firefox, login in Firefox
   - Incognito/Private mode has separate storage

2. **Check if your user exists**
   - Open browser console (F12 or Right-click → Inspect)
   - Type: `window.debugTMS.viewAllUsers()`
   - This will show all registered users in localStorage
   - Verify your email is in the list

3. **Clear and re-register**
   - Open browser console
   - Type: `window.debugTMS.clearAllUsers()`
   - Go to `/register` and create a new account
   - Use the same browser to login

4. **Export your data (backup)**
   - Open browser console
   - Type: `window.debugTMS.exportUsers()`
   - This downloads a JSON file with all users
   - You can import this later if needed

### Form Validation Issues

**Fixed Issues:**
- ✅ Validation now triggers when you click away (onBlur)
- ✅ Confirm password field now shows validation errors
- ✅ Real-time validation after first blur
- ✅ Clear error messages for all fields

**How it works now:**
1. Fill in a field
2. Click away or tab to next field
3. Validation error appears if invalid
4. Error clears as you type valid input
5. All fields validate on submit

## Data Storage Location

### Where is data stored?

**Browser localStorage** at key: `tms_users`

**Location by browser:**
- **Chrome/Edge:** DevTools → Application → Local Storage → http://localhost:3000
- **Firefox:** DevTools → Storage → Local Storage → http://localhost:3000
- **Safari:** DevTools → Storage → Local Storage → http://localhost:3000

### View stored data

**Method 1: Browser DevTools**
1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Expand Local Storage
4. Click on your domain
5. Find `tms_users` key

**Method 2: Console Commands**
```javascript
// View all users
window.debugTMS.viewAllUsers()

// Clear all users
window.debugTMS.clearAllUsers()

// Export users to file
window.debugTMS.exportUsers()

// Manual check
JSON.parse(localStorage.getItem('tms_users'))
```

## Common Issues

### 1. Can't login after registration

**Check:**
- Are you using the same browser?
- Did you clear browser data?
- Is localStorage enabled?

**Fix:**
```javascript
// Check if user exists
window.debugTMS.viewAllUsers()

// If not found, register again
// If found, verify email matches exactly
```

### 2. Password validation too strict

**Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

**Example valid passwords:**
- `Password123`
- `MyPass99`
- `Test1234`

### 3. Confirm password not showing errors

**Fixed!** The confirm password field now:
- Shows error when you click away
- Validates against the password field
- Updates in real-time if password changes

### 4. Data lost after browser restart

**This is expected behavior** with localStorage. Data persists unless:
- You clear browser data
- You use incognito/private mode
- You switch browsers
- Browser storage is full

**Solution for production:**
- Migrate to AWS DynamoDB (planned)
- Use server-side session storage
- Implement data export/import

## Development Tips

### Testing with multiple users

```javascript
// View all registered users
window.debugTMS.viewAllUsers()

// Clear all users to start fresh
window.debugTMS.clearAllUsers()

// Register multiple test users
// User 1: owner@test.com / Password123
// User 2: driver@test.com / Password123
```

### Debugging authentication

```javascript
// Check current session
console.log('Session:', await fetch('/api/auth/session').then(r => r.json()))

// Check stored users
window.debugTMS.viewAllUsers()

// Test password hashing
// (passwords are hashed with bcrypt, so you can't see plain text)
```

### Reset everything

```javascript
// Clear all app data
window.debugTMS.clearAllUsers()
localStorage.clear()
sessionStorage.clear()

// Then refresh the page
location.reload()
```

## Production Deployment Notes

### Current Limitations

1. **localStorage is not suitable for production**
   - Data is client-side only
   - No data persistence across devices
   - No backup or recovery
   - Limited to ~5-10MB per domain

2. **Migration Path**
   - AWS DynamoDB for user data
   - AWS Cognito for authentication
   - Server-side session management
   - Data encryption at rest

### Environment Variables Required

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
DEEPSEEK_API_KEY=your-deepseek-api-key
```

## Getting Help

### Check these first:
1. Browser console for errors
2. Network tab for API failures
3. localStorage for data presence
4. Same browser used for registration

### Debug commands:
```javascript
// Full diagnostic
console.log('Users:', window.debugTMS.viewAllUsers())
console.log('Session:', await fetch('/api/auth/session').then(r => r.json()))
console.log('LocalStorage:', localStorage.getItem('tms_users'))
```

### Still having issues?

1. Clear all data: `window.debugTMS.clearAllUsers()`
2. Refresh page
3. Register new account
4. Login immediately in same browser
5. Check console for errors

## Future Improvements

- [ ] Migrate to AWS DynamoDB
- [ ] Add data export/import UI
- [ ] Implement server-side sessions
- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Add multi-device sync
- [ ] Add data backup/restore

