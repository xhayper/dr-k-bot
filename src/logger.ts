import pino, { DestinationStream, StreamEntry } from 'pino';
import pretty from 'pino-pretty';
import path from 'node:path';
import fs from 'node:fs';

if (!fs.existsSync(path.join(__dirname, '../logs'))) fs.mkdirSync(path.join(__dirname, '../logs'));

const streams = [
  {
    stream: pretty({
      destination: fs.createWriteStream(path.join(__dirname, `../logs/${new Date().toISOString()}.log`)),
      colorize: false,
      ignore: 'pid,hostname'
    })
  },
  {
    stream: pretty({
      colorize: true,
      ignore: 'pid,hostname'
    })
  }
] as (DestinationStream | StreamEntry)[] | DestinationStream | StreamEntry;

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
