import path from 'path';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));

export default config as {
  guildId: string;
  user: {
    botOwner: string[];
  };
  role: {
    administrator: string;
    moderator: string;
    intern: string;
  };
  channel: {
    audit: string;
    verification: string;
  };
};
