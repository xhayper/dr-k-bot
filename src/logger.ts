import Winston from 'winston';
import path from 'path';

const logger = Winston.createLogger({
  level: process.env.DEBUG === 'true' ? 'debug' : 'info',
  format: Winston.format.combine(
    Winston.format.errors({ stack: true }),
    Winston.format.timestamp({
      format: 'DD-MM-YYYY HH:MM:SS'
    }),
    Winston.format.printf((msg) =>
      Winston.format
        .colorize()
        .colorize(msg.level, `[${msg.timestamp}] [${msg.level.toUpperCase()}] ${msg.stack || msg.message}`)
    )
  ),
  transports: [
    new Winston.transports.Console(),
    // Normal
    new Winston.transports.File({
      filename: path.join(__dirname, '../logs/latest.log'),
      options: { flags: 'w' },
      handleExceptions: true
    }),
    new Winston.transports.File({
      filename: path.join(__dirname, `../logs/${new Date().toISOString()}.log`),
      handleExceptions: true
    })
  ]
});

export { logger as Logger };
