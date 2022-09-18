import pretty from 'pino-pretty';
import path from 'node:path';
import fs from 'node:fs';
import pino from 'pino';

const streams = [
  { stream: fs.createWriteStream(path.join(__dirname, `../logs/${new Date().toISOString()}.log`)) },
  {
    stream: pretty({
      colorize: true,
      ignore: 'pid,hostname'
    })
  }
] as any;

const logger = pino(
  {
    base: null,
    sync: true
  },
  pino.multistream(streams)
);

process.on('uncaughtException', (err) => {
  logger.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error(err);
  process.exit(1);
});

export { logger as Logger };
