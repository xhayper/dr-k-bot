import { TypedEvent } from '../base/clientEvent';
import { Client, Message } from 'discord.js';
import { GuildUtility } from '..';

export default TypedEvent({
  eventName: 'messageCreate',
  on: async (_: Client, message: Message) => {
    // if (!message.member || message.author.bot || GuildUtility.isModerator(message.member)) return;
    // if (
    //   ![/KP/gim, /Kaiju Paradise/gim, /TFE/gim, /The Finale Experiment/gim].some((regex) => regex.test(message.content))
    // )
    //   return;
    // await message.reply('Please, Don\'t mention "Kaiju Paradise" or "The Finale Experiment"');
    // await message.delete();
  }
});
