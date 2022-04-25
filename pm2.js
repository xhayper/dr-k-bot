require('dotenv/config');

const { execSync } = require('child_process');

execSync(`pm2 link ${process.env.PM2_PUBLIC_KEY} ${process.env.PM2_SECRET_KEY}`);

pm2.connect(function (err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start(
    {
      script: 'dist/index.js',
      name: 'dr-k-bot'
    },
    (err, apps) => {
      if (err) {
        console.error(err);
        return pm2.disconnect();
      }

      pm2.list((err, list) => {
        console.log(err, list);

        pm2.restart('dr-k-bot', (err, proc) => {
          // Disconnects from PM2
          pm2.disconnect();
        });
      });
    }
  );
});
