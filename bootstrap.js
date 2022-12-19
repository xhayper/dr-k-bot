const { fork } = require('node:child_process'),
  util = require('node:util'),
  path = require('node:path');

const exec = util.promisify(require('node:child_process').exec);

const run = (cmd, options) => exec(cmd, { ...options, stdio: 'inherit' });

const log = (...msg) => console.log('BOOTSTRAP:', ...msg);

(async () => {
  log('START!');

  const botFolder = path.join(__dirname, 'bot');

  // We install packages
  log('INSTALLING PACKAGES!');
  await run('yarn install', { cwd: botFolder });

  // Then generate prisma files
  log('GENERATING PRISMA FILES!');
  await run('yarn add prisma', { cwd: botFolder });
  await run('npx prisma generate', { cwd: botFolder });
  await run('yarn remove prisma', { cwd: botFolder });

  // Clean up
  log('CLEANING UP!');
  await run('rm -r -f node_modules');
  await run('rm -r -f .cache');
  await run('rm -r -f .yarn');
  await run('rm -r -f .npm');

  log('END!');

  // Then run the bot
  fork(path.join(botFolder, 'dist', 'index.js'), process.argv, { cwd: botFolder, stdio: 'inherit' });
})();
