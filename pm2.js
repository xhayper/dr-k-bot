require('dotenv/config');

const  { exec } = require('child_process');

exec(`pm2 link ${process.env.PM2_PUBLIC_KEY} ${process.env.PM2_SECRET_KEY}`);
exec(`pm2 start ecosystem.config.js`);