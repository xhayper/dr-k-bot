import { Client, Collection, Message, Snowflake } from 'discord.js';
import { TypedEvent } from '../base/clientEvent';
import config from '../config';
import path from 'path';
import fs from 'fs';

const insultList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../insult.json'), 'utf8')) as string[];

const channelList = [config.channel['general-1'], config.channel['general-2']];

const userMediaCount = new Collection<Snowflake, number>();
const userTimeoutMap = new Collection<Snowflake, NodeJS.Timeout>();

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

    if (channelList.includes(message.channel.id))
      if (message.attachments.size > 0) {
        if (!userTimeoutMap.has(message.author.id))
          userTimeoutMap.set(
            message.author.id,
            setTimeout(() => {
              userMediaCount.delete(message.author.id);
            }, config.misc.mediaCooldown * 60 * 1000)
          );

        let mediaCount = userMediaCount.get(message.author.id) || 0;
        mediaCount += message.attachments.size;

        userMediaCount.set(message.author.id, mediaCount);

        if (mediaCount > config.misc.mediaLimit)
          return message.reply('Your limit for media have been exceeded. Please move to a more appropriate channel.');
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
