import path from 'node:path';
import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));

export default config as {
  guildId: string;
  user: {
    botOwner: string[];
  };
  role: {
    headSecurity: string;
    seniorSecurity: string;
    security: string;
    intern: string;
    verificationTeam: string;
    unverified: string;
    levelZero: string;
    levelRoles: string[];
    patreonRoles: string[];
  };
  channel: {
    auditLog: string;
    verificationLog: string;
    ticketThread: string;
    'user-verification': string;
    'general-1': string;
    'general-2': string;
    'role-selection': string;
    'art-channel': string;
    'image-storage': string;
  };
  toggleRole: {
    [key: string]: string;
  };
  // questions: string[];
  misc: {
    mediaCooldown: number;
    mediaLimit: number;
  };
};
