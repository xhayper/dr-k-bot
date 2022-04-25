// The Final Experiment
import { TypedEvent } from '../base/clientEvent';
import { Client, Message } from 'discord.js';
import { GuildUtility } from '..';

export default TypedEvent({
  eventName: 'messageCreate',
  on: async (_: Client, message: Message) => {
    if (message.author.bot || GuildUtility.isModerator(message.member!)) return;
    if (
      ![/KP/gim, /Kaiju Paradise/gim, /TFE/gim, /The Finale Experience/gim].some((regex) => regex.test(message.content))
    )
      return;
    message.delete();
  }
});
