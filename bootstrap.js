const { execSync, fork } = require('node:child_process'),
  path = require('node:path');

const log = (...msg) => console.log('BOOTSTRAP:', ...msg);

log('START!');

const botFolder = path.join(__dirname, 'bot');

const exec = (cmd, options) => execSync(cmd, { ...options, stdio: 'inherit' });

// We install packages
log('INSTALLING PACKAGES!');
exec('yarn install', { cwd: botFolder });

// Then generate prisma files
log('GENERATING PRISMA FILES!');
exec('yarn add prisma', { cwd: botFolder });
exec('npx prisma generate', { cwd: botFolder });
exec('yarn remove prisma', { cwd: botFolder });

// Clean up
log('CLEANING UP!');
exec('rm -r -f node_modules');
exec('rm -r -f .cache');
exec('rm -r -f .yarn');

log('END!');

// Then run the bot
fork(path.join(botFolder, 'dist', 'index.js'), process.argv, { cwd: botFolder, stdio: 'inherit' });
