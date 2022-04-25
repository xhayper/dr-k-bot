require('dotenv/config');

require('@pm2/io').init({
  standalone: true,
  apmOptions: {
    publicKey: process.env.PM2_PUBLIC_KEY,
    secretKey: process.env.PN2_SECRET_KEY,
    appName: 'dr-k-bot'
  }
});

require('./dist/index');