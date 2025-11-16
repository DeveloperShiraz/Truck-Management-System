# 👥 User Management Guide

Complete guide to managing users in the Truck Management System.

## Overview

Users are stored in `data/users.json` - a simple JSON file that's tracked in git. This makes it easy to:
- ✅ Test with pre-configured accounts
- ✅ Deploy with users already in place
- ✅ Easily add/remove test users
- ✅ Backup and restore user data

## Pre-configured Test Users

The system comes with two test accounts:

### Truck Owner Account
- **Email:** `owner@test.com`
- **Password:** `Password123`
- **Use for:** Testing fleet management, truck registration, checklist creation

### Driver Account
- **Email:** `driver@test.com`
- **Password:** `Password123`
- **Use for:** Testing fleet joining, checklist completion

## Quick Commands

### List All Users
```bash
npm run users:list
```

Shows all registered users with their details:
- Name
- Email
- Role
- ID
- Creation date
- Fleet membership (if applicable)

### Clear All Users
```bash
npm run users:clear
```

Removes all users from the system. Useful for starting fresh.

### Reset to Test Users
```bash
npm run users:reset
```

Resets the system to the two default test accounts. Use this after testing to clean up.

### Generate Password Hash
```bash
npm run users:hash YourPassword123
```

Generates a bcrypt hash for a password. Use this when manually adding users to the JSON file.

## Manual User Management

### View Users
Simply open `data/users.json` in your editor to see all users.

### Delete Specific Users
1. Open `data/users.json`
2. Find the user object you want to remove
3. Delete the entire object (including commas)
4. Save the file

### Add Users Manually

1. **Generate a password hash:**
   ```bash
   npm run users:hash YourPassword123
   ```

2. **Copy the hash from the output**

3. **Add user to `data/users.json`:**
   ```json
   {
     "id": "user_custom_001",
     "email": "newuser@example.com",
     "password": "$2a$10$hashedPasswordHere...",
     "name": "New User",
     "role": "owner",
     "createdAt": "2024-01-01T00:00:00.000Z",
     "updatedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

4. **Save the file**

### Edit User Details

You can edit any user field except the password (must be hashed):
- `name` - Display name
- `email` - Login email
- `role` - "owner" or "driver"
- `fleetOwnerId` - ID of fleet owner (for drivers)

**Example:**
```json
{
  "id": "user_test_driver_001",
  "email": "driver@test.com",
  "password": "$2a$10$...",
  "name": "Updated Driver Name",
  "role": "driver",
  "fleetOwnerId": "user_test_owner_001",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## User Object Structure

```json
{
  "id": "string",              // Unique user ID (required)
  "email": "string",           // User email - must be unique (required)
  "password": "string",        // Bcrypt hashed password (required)
  "name": "string",            // Display name (required)
  "role": "owner|driver",      // User role (required)
  "fleetOwnerId": "string",    // Fleet owner ID (optional, for drivers)
  "activeFleetCode": "string", // Active fleet code (optional, for owners)
  "createdAt": "ISO date",     // Creation timestamp (required)
  "updatedAt": "ISO date"      // Last update timestamp (required)
}
```

## Common Scenarios

### Scenario 1: Testing Fleet Features

1. Login as owner: `owner@test.com` / `Password123`
2. Generate a fleet code
3. Logout
4. Login as driver: `driver@test.com` / `Password123`
5. Join the fleet using the code
6. Test fleet features

### Scenario 2: Clean Up After Testing

```bash
npm run users:reset
```

This removes any users created during testing and resets to the two test accounts.

### Scenario 3: Deploy with Custom Users

1. Edit `data/users.json` directly
2. Add your production users
3. Commit and push to GitHub
4. Deploy to Netlify
5. Users will be available immediately

### Scenario 4: Backup Users

```bash
# Backup
cp data/users.json data/users.backup.json

# Restore
cp data/users.backup.json data/users.json
```

### Scenario 5: Export Users for Database Migration

When ready to migrate to AWS DynamoDB:

1. Users are already in JSON format
2. Write a migration script to read `data/users.json`
3. Import each user to DynamoDB
4. Update storage layer to use DynamoDB
5. Keep `data/users.json` as backup

## Security Considerations

### Password Hashing
- All passwords are hashed with bcrypt (10 salt rounds)
- Never store plain text passwords
- Use `npm run users:hash` to generate hashes

### Test Users in Production
- Consider removing test users before production deployment
- Or change test user passwords to something secure
- Test users have predictable credentials

### File Permissions
- Ensure `data/users.json` is writable by the application
- On Netlify, the file is read-only after deployment
- New users registered through the app won't persist (use database for production)

## Troubleshooting

### Issue: Can't login with test users

**Solution:**
1. Check `data/users.json` exists
2. Verify test users are in the file
3. Try resetting: `npm run users:reset`
4. Check password is exactly: `Password123`

### Issue: Users not persisting after registration

**Solution:**
This is expected behavior on Netlify (read-only file system). For production:
1. Migrate to AWS DynamoDB
2. Or use a database service
3. File-based storage is for development/testing only

### Issue: JSON syntax error

**Solution:**
1. Validate JSON syntax: https://jsonlint.com
2. Check for missing commas between objects
3. Ensure proper bracket matching
4. Restore from backup if corrupted

### Issue: Password hash not working

**Solution:**
1. Generate new hash: `npm run users:hash YourPassword`
2. Copy the entire hash (starts with `$2a$10$`)
3. Paste into JSON file
4. Ensure no extra spaces or line breaks

## Advanced Usage

### Bulk User Creation

Create a script to generate multiple users:

```javascript
const bcrypt = require('bcryptjs');
const fs = require('fs');

async function createUsers() {
  const users = [];
  
  for (let i = 1; i <= 10; i++) {
    const hash = await bcrypt.hash(`Password${i}`, 10);
    users.push({
      id: `user_bulk_${i}`,
      email: `user${i}@test.com`,
      password: hash,
      name: `Test User ${i}`,
      role: i % 2 === 0 ? 'owner' : 'driver',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
  console.log('Created 10 test users');
}

createUsers();
```

### User Statistics

```bash
# Count total users
npm run users:list | grep "Total Users"

# Count by role
cat data/users.json | grep '"role"' | sort | uniq -c
```

## Best Practices

1. **Development:**
   - Use test accounts for development
   - Reset users regularly: `npm run users:reset`
   - Commit user changes to git

2. **Testing:**
   - Create specific test users for different scenarios
   - Document test user credentials
   - Clean up after testing

3. **Production:**
   - Remove or secure test users
   - Migrate to database for persistence
   - Implement proper user management UI
   - Add email verification
   - Add password reset functionality

4. **Backup:**
   - Backup `data/users.json` before major changes
   - Keep backups in a secure location
   - Test restore process

## Migration Path

When ready for production:

1. **Phase 1:** File-based (current)
   - Simple and easy to manage
   - Good for development/testing
   - Limited scalability

2. **Phase 2:** AWS DynamoDB
   - Scalable and persistent
   - Supports concurrent access
   - Better for production

3. **Phase 3:** AWS Cognito
   - Managed authentication
   - Email verification
   - Password reset
   - Multi-factor authentication

## Support

For issues or questions:
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review [README.md](./README.md)
- Open an issue on GitHub

---

Happy user managing! 👥
