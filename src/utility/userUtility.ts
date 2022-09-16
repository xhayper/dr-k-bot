import { PartialUser, User } from 'discord.js';
import config from '../config';

export class UserUtility {
  public isBotOwner(user: User | PartialUser): boolean {
    return config.user.botOwner.includes(user.id);
  }
}
