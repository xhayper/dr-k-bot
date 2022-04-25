require('dotenv/config');

const pm2 = require('pm2'),
  path = require('path');

// exec(`npx pm2 plus`);
// exec(`npx pm2 link ${process.env.PM2_PUBLIC_KEY} ${process.env.PM2_SECRET_KEY}`);

pm2.connect((err) => {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start({
    autorestart: true,
    script: path.join(__dirname, 'dist/index.js'),
    name: 'dr-k-bot',
    source_map_support: true
  });
});
