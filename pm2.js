require('dotenv/config');

const { execSync } = require('child_process'),
  path = require('path');

execSync(`pm2 plus`);
execSync(`pm2 link ${process.env.PM2_PUBLIC_KEY} ${process.env.PM2_SECRET_KEY}`);

pm2.connect(true, (err) => {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start({
    script: path.join(__dirname, 'dist/index.js'),
    name: 'dr-k-bot'
  });
});
