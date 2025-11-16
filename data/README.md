# Data Directory

This directory contains the user data stored in JSON format.

## users.json

This file stores all registered users. It's tracked in git for easy testing and deployment.

### Pre-configured Test Users

The file comes with two test accounts:

1. **Truck Owner**
   - Email: `owner@test.com`
   - Password: `Password123`
   - ID: `user_test_owner_001`

2. **Driver**
   - Email: `driver@test.com`
   - Password: `Password123`
   - ID: `user_test_driver_001`

### Managing Users

#### View All Users

Simply open `data/users.json` in your editor to see all registered users.

#### Delete Test Users

To remove test users, edit `data/users.json` and remove the user objects you don't want.

#### Delete All Users

To start fresh, replace the contents of `data/users.json` with:
```json
[]
```

#### Add a User Manually

You can add users directly to the JSON file, but passwords must be hashed with bcrypt.

**Generate a hashed password:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123', 10).then(hash => console.log(hash))"
```

Then add the user object:
```json
{
  "id": "user_unique_id_here",
  "email": "user@example.com",
  "password": "$2a$10$hashedPasswordHere...",
  "name": "User Name",
  "role": "owner",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### File Structure

```json
[
  {
    "id": "string",              // Unique user ID
    "email": "string",           // User email (unique)
    "password": "string",        // Bcrypt hashed password
    "name": "string",            // User display name
    "role": "owner" | "driver",  // User role
    "fleetOwnerId": "string",    // (Optional) ID of fleet owner for drivers
    "activeFleetCode": "string", // (Optional) Active fleet code for owners
    "createdAt": "ISO date",     // Account creation date
    "updatedAt": "ISO date"      // Last update date
  }
]
```

### Deployment Notes

#### For Development
- Keep test users in the file for easy testing
- Edit directly as needed
- Commit changes to git

#### For Production
- Consider removing test users before deploying
- Or change test user passwords
- Users registered through the app will be added to this file

### Backup

To backup your users:
```bash
cp data/users.json data/users.backup.json
```

To restore:
```bash
cp data/users.backup.json data/users.json
```

### Migration to Database

When ready to migrate to AWS DynamoDB:
1. Export users from this file
2. Import to DynamoDB
3. Update storage layer to use DynamoDB
4. Keep this file as a backup

### Security Notes

⚠️ **Important:**
- Passwords are hashed with bcrypt (10 salt rounds)
- Never store plain text passwords
- This file is tracked in git for development convenience
- For production, consider using a database instead
- Rotate test user passwords if exposed publicly

### Troubleshooting

**Issue:** Users not persisting after registration
- Check file permissions (should be writable)
- Check for JSON syntax errors
- Verify the data directory exists

**Issue:** Can't login with test users
- Verify the passwords are correct: `Password123`
- Check the JSON file is valid
- Ensure bcrypt hashes are intact

**Issue:** File gets corrupted
- Restore from backup
- Or reset to default test users (see above)

---

For more information, see the main [README.md](../README.md)
