require('dotenv/config');

const pm2 = require('pm2'),
  { exec } = require('child_process');

exec(`pm2 link ${process.env.PM2_PUBLIC_KEY} ${process.env.PM2_SECRET_KEY}`);

pm2.connect((err) => {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start(
    {
      script: 'dist/index.js',
      name: 'dr-k'
    },
    (err) => {
      if (err) {
        console.error(err);
        return pm2.disconnect();
      }

      pm2.list((err, list) => {
        console.log(err, list);

        pm2.restart('dr-k', (err, proc) => {
          // Disconnects from PM2
          pm2.disconnect();
        });
      });
    }
  );
});
