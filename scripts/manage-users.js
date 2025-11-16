#!/usr/bin/env node

/**
 * User Management Script
 * 
 * Usage:
 *   node scripts/manage-users.js list              - List all users
 *   node scripts/manage-users.js clear             - Clear all users
 *   node scripts/manage-users.js reset             - Reset to default test users
 *   node scripts/manage-users.js hash <password>   - Generate password hash
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Read users from file
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error.message);
    return [];
  }
}

// Write users to file
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log('✅ Users file updated successfully');
  } catch (error) {
    console.error('❌ Error writing users file:', error.message);
  }
}

// List all users
function listUsers() {
  const users = readUsers();
  
  if (users.length === 0) {
    console.log('No users found.');
    return;
  }
  
  console.log(`\n📋 Total Users: ${users.length}\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${user.createdAt}`);
    if (user.fleetOwnerId) {
      console.log(`   Fleet Owner: ${user.fleetOwnerId}`);
    }
    console.log('');
  });
}

// Clear all users
function clearUsers() {
  writeUsers([]);
  console.log('✅ All users cleared');
}

// Reset to default test users
async function resetUsers() {
  const hash1 = await bcrypt.hash('Password123', 10);
  const hash2 = await bcrypt.hash('Password123', 10);
  
  const defaultUsers = [
    {
      id: 'user_test_owner_001',
      email: 'owner@test.com',
      password: hash1,
      name: 'Test Owner',
      role: 'owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user_test_driver_001',
      email: 'driver@test.com',
      password: hash2,
      name: 'Test Driver',
      role: 'driver',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  writeUsers(defaultUsers);
  console.log('✅ Reset to default test users:');
  console.log('   - owner@test.com / Password123');
  console.log('   - driver@test.com / Password123');
}

// Generate password hash
async function hashPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log('\n🔐 Password Hash:');
  console.log(hash);
  console.log('\nUse this hash in users.json for the password field.');
}

// Main
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'list':
      listUsers();
      break;
    
    case 'clear':
      clearUsers();
      break;
    
    case 'reset':
      await resetUsers();
      break;
    
    case 'hash':
      const password = process.argv[3];
      if (!password) {
        console.error('❌ Please provide a password to hash');
        console.log('Usage: node scripts/manage-users.js hash <password>');
        process.exit(1);
      }
      await hashPassword(password);
      break;
    
    default:
      console.log('User Management Script\n');
      console.log('Usage:');
      console.log('  node scripts/manage-users.js list              - List all users');
      console.log('  node scripts/manage-users.js clear             - Clear all users');
      console.log('  node scripts/manage-users.js reset             - Reset to default test users');
      console.log('  node scripts/manage-users.js hash <password>   - Generate password hash');
      break;
  }
}

main().catch(console.error);
