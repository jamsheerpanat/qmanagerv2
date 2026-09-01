/**
 * Records what this build is, for the version label on the login page.
 *
 * Written after `nest build`, so it describes the compiled output rather than
 * the checkout. That distinction matters: a deploy can leave the working tree
 * ahead of the build it is actually running, and reading the SHA at runtime
 * would then report a version that is not the one serving requests.
 *
 * Best effort by design — a failure here must never fail the deploy.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function gitSha() {
  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
      cwd: __dirname,
    })
      .toString()
      .trim();
  } catch {
    return process.env.BUILD_SHA?.trim() || 'unknown';
  }
}

function utcStamp(d) {
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ` +
    `${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`
  );
}

try {
  const dir = path.join(__dirname, 'dist');
  fs.mkdirSync(dir, { recursive: true });
  const info = { sha: gitSha(), builtAt: utcStamp(new Date()) };
  fs.writeFileSync(path.join(dir, 'build-info.json'), JSON.stringify(info));
  console.log(`build-info: ${info.sha} @ ${info.builtAt}`);
} catch (err) {
  console.warn('build-info: could not be written —', String(err));
}
