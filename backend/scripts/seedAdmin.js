// Create or repair an admin account.
//
// PowerShell:
//   $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="StrongPass1"; npm run seed:admin
// Mac/Linux:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=StrongPass1 npm run seed:admin
//
// If the user already exists it is promoted to admin AND its password is reset
// to ADMIN_PASSWORD, so this script can also be used to recover a lost login.
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.js';

dotenv.config();

const email = (process.env.ADMIN_EMAIL || 'admin@jobportal.local').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

if (password.length < 6) {
  console.error('ADMIN_PASSWORD must be at least 6 characters.');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal');

let user = await User.findOne({ email }).select('+password');
if (user) {
  user.role = 'admin';
  user.isActive = true;
  user.password = password; // re-hashed by the pre-save hook
  await user.save();
  console.log(`Existing account ${email} is now an admin and its password was reset.`);
} else {
  await User.create({ firstName: 'Site', lastName: 'Admin', email, password, role: 'admin' });
  console.log(`Admin created: ${email}`);
}

// Verify what is really stored in the database
user = await User.findOne({ email }).select('+password');
const ok = await user.comparePassword(password);
console.log(`Stored role: ${user.role} | active: ${user.isActive} | password check: ${ok ? 'OK' : 'FAILED'}`);
console.log(`\nLog in at http://localhost:5173/login with:\n  Email:    ${email}\n  Password: ${password}`);

await mongoose.disconnect();