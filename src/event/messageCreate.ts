import { TypedEvent } from '../base/clientEvent';
import { Client, Message } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { GuildUtility } from '..';
import config from '../config';

const insultList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../insult.json'), 'utf8')) as string[];

const channelList=[
  "general-1",
  "general-2"
];
const savedMessages={};

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
    for (channelName in channelList) {
      if (message.channel.id == config.channel[channelName]) {
      
        if (message.attachments.size > 0) { 
          
          userTemp = savedMessages[message.author.id];
          if (userTemp==null) userTemp={};
          userTemp[message.id]=message;
          
          setTimeout(() => {
            delete userTemp[message.id];
          }, config.misc.mediaTimer*60*1000);
          
          if (userTemp.length > config.misc.mediaLimit) {
            message.reply("Your limit for media have been exceeded. Please move to a more appropriate channel.");
          }
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
