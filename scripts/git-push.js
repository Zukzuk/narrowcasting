#!/usr/bin/env node
import { execSync } from 'child_process';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

try {
  run('git fetch origin main');
  const ahead = parseInt(
    execSync('git rev-list --count origin/main..HEAD').toString(),
    10
  );
  if (ahead === 0) {
    console.log('No new commits to push');
    process.exit(0);
  }

  // there is something to push
  run('standard-version');
  run('git push --follow-tags origin main');
  run('cross-env APP_RUN=false npm run dev');
} catch (e) {
  console.error(e);
  process.exit(1);
}
