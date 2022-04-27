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
    verificationTeam: string;
    unverified: string;
  };
  channel: {
    auditLog: string;
    verificationLog: string;
    ticketThread: string;
    'general-1': string;
    'role-selection': string;
  };
  toggleRole: {
    [key: string]: string;
  };
  questions: string[]; 
  // Chat filters should be in regex and be strings
  misc: {
    // chatFilters: string[];
    killSwitch: string; 
    mediaTimer: string;
    mediaLimit: string;
  };
};
