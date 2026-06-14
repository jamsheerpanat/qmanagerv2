const { exec } = require('child_process');
exec('pm2 env qmanager2-api', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  const lines = stdout.split('\n');
  const dbUrl = lines.find(line => line.includes('DATABASE_URL'));
  if (dbUrl) {
    console.log('FOUND REAL DATABASE_URL:', dbUrl);
  } else {
    console.log('DATABASE_URL not found in pm2 env. Full output:', stdout);
  }
});
