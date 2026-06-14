const { exec } = require('child_process');
exec('pm2 jlist', (error, stdout) => {
  if (error) return;
  const list = JSON.parse(stdout);
  const qapi = list.find(p => p.name === 'qmanager2-api');
  console.log('qmanager2-api cwd:', qapi?.pm2_env?.pm_cwd);
  const api = list.find(p => p.name === 'api');
  console.log('api cwd:', api?.pm2_env?.pm_cwd);
});
