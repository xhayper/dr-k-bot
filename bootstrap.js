const { execSync, fork } = require('node:child_process'),
  path = require('node:path');

const package = require('./bot/package.json');

/**
 * @param {string} command The command to run.
 * @param {import("node:child_process").ExecSyncOptions} [options]
 * @returns {string | Buffer} The stdout from the command.
 */
const run = (command, options) => execSync(command, { ...(options ?? {}), stdio: 'inherit' });

/**
 *
 * @param  {...string} message
 */
const log = (...message) => void console.log('BOOTSTRAP:', ...message);

const botFolder = path.join(__dirname, 'bot');

const prismaVersion = (package.dependencies['@prisma/client'] ?? package.devDependencies['@prisma/client'] ?? '')
  .replace('^', '')
  .replace('@', '');

log('START!');

// We install packages
log('INSTALLING PACKAGES!');
run('npm install --omit=dev', { cwd: botFolder });

// Then generate prisma files
log('GENERATING PRISMA FILES!');
run(`npm install -D prisma${prismaVersion ? '@' + prismaVersion : ''}`, { cwd: botFolder });
run('npx prisma generate', { cwd: botFolder });
run('npm remove prisma', { cwd: botFolder });

// Clean up
log('CLEANING UP!');
run('rm -r -f node_modules');
run('rm -r -f .cache');
run('rm -r -f .npm');

log('END!');

// Then run the bot
fork(path.join(botFolder, 'dist', 'index.js'), process.argv, { cwd: botFolder, stdio: 'inherit' });
