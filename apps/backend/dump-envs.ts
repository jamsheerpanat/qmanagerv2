import * as fs from 'fs';
import * as path from 'path';

console.log('--- BACKEND .ENV ---');
try {
  const backendEnv = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  console.log(backendEnv.replace(/password=.*?@/, 'password=***@'));
} catch (e) {
  console.log('Backend .env not found');
}

console.log('\n--- FRONTEND .ENV ---');
try {
  const frontendEnv = fs.readFileSync(path.join(__dirname, '../../frontend/.env'), 'utf8');
  console.log(frontendEnv);
} catch (e) {
  try {
    const frontendEnvLocal = fs.readFileSync(path.join(__dirname, '../../frontend/.env.local'), 'utf8');
    console.log('.env.local:', frontendEnvLocal);
  } catch(err) {
    console.log('Frontend .env not found');
  }
}
