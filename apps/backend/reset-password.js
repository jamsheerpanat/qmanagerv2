const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Production database on the server
const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5436/qmanager?schema=public'
});

async function resetPassword() {
  const email = process.argv[2] || 'jamsheer@octonics.com';
  const newPassword = process.argv[3] || 'Admin@123';
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  // First check if user exists
  const checkResult = await pool.query('SELECT id, email, name, status FROM "User" WHERE email = $1', [email]);
  
  if (checkResult.rows.length === 0) {
    // List all users
    const allUsers = await pool.query('SELECT email, name, status FROM "User" ORDER BY email');
    console.log('User not found. Available users:');
    allUsers.rows.forEach(u => console.log(`  ${u.email} (${u.name}) - ${u.status}`));
  } else {
    const user = checkResult.rows[0];
    console.log(`Found user: ${user.name} (${user.email}) - Status: ${user.status}`);
    
    await pool.query('UPDATE "User" SET "passwordHash" = $1 WHERE email = $2', [passwordHash, email]);
    console.log(`Password reset to: ${newPassword}`);
  }
  
  await pool.end();
}

resetPassword().catch(console.error);
