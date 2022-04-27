import { TypedEvent } from '../base/clientEvent';
import { Client, Message } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { GuildUtility } from '..';
import config from '../config';

const insultList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../insult.json'), 'utf8')) as string[];
var savedMessages = { // Only a list of general-1 messages for now. 
  'general-1':[]
}; 

export default TypedEvent({
  eventName: 'messageCreate',
  on: async (client: Client, message: Message) => {
    if (message.author.bot || message.channel.type == 'DM') return;
    
    const splitText = message.content.split(' ');

    // if (splitText[0] == '!hayperimergencygiverole') {
    //   if (!message.member || !GuildUtility.isBotOwner(message.member)) return message.reply("No u");
    //   await message.member.roles.add('895152300354576394');
    //   await message.member.roles.add('895152636842627072');
    //   await message.member.roles.add('900568768667877386');
    //   await message.member.roles.add('900568107033178162');
    //   message.reply("Ok, Boomer");
    //   return;
    // }
    
    for (channelName in Object.keys(savedMessages)) {
      if (message.channel.id == config.channel[channelName]) {
      
        if (message.attachments.size > 0) { // Doesn't differentiate between attatchements, might have to fix that later.
          savedMessages[channelName][message.id]=message; 
        }
      
        for (ID in Object.keys(savedMessages[channelName])) {
          if (Date().getTime() - savedMessages[channelName][ID].createdTimestamp > config.misc.mediaTimer*60*1000) { 
            delete savedMessages[channelName][ID];
          }
        }
    
        if (Object.keys(savedMessages[channelName]).length > config.misc.mediaLimit) { 
          channel.send("Channel limits for media have been exceeded. Please move to a more appropriate channel.") // TODO: Change message to directly point to media
        }
      }
    }
    if (
      message.mentions.users.size == 0 ||
      0 >= splitText.length ||
      ![`<@${client.user!.id}>`, `<@!${client.user!.id}>`].some((mentionText) => splitText[0].startsWith(mentionText))
    )
      return;

    await message.reply({
      content: insultList[Math.floor(Math.random() * insultList.length)],
      allowedMentions: {
        repliedUser: false
      }
    });
  }
});
