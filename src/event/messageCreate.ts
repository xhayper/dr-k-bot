import { Client, Collection, Message, Snowflake } from 'discord.js';
import { TypedEvent } from '../base/clientEvent';
import config from '../config';
import path from 'path';
import fs from 'fs';

const insultList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../insult.json'), 'utf8')) as string[];

const channelList = [config.channel['general-1'], config.channel['general-2']];

const userMediaCount = new Collection<Snowflake, Collection<Snowflake, number>>();
const userTimeMap = new Collection<Snowflake, Collection<Snowflake, Date>>();

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

    if (channelList.includes(message.channel.id) && message.attachments.size > 0) {
      const timeMap = userTimeMap.get(message.channel.id) || new Collection<Snowflake, Date>();
      const countMap = userMediaCount.get(message.channel.id) || new Collection<Snowflake, number>();

      const timePassed = timeMap.has(message.author.id)
        ? new Date().getTime() - timeMap.get(message.author.id)!.getTime() > config.misc.mediaCooldown * 1000
        : true;

      if (!timeMap.has(message.author.id) || timePassed) timeMap.set(message.author.id, new Date());

      let mediaCount =
        (!timePassed && countMap.has(message.author.id) ? countMap.get(message.author.id)! : 0) +
        message.attachments.size;

      countMap.set(message.author.id, mediaCount);

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
