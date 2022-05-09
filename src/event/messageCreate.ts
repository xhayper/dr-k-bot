import { EmbedUtility, GuildUtility } from '..';
import { Client, Collection, Message, Snowflake } from 'discord.js';
import { TypedEvent } from '../base/clientEvent';
import translate from 'google-translate-api';
import config from '../config';
import path from 'path';
import fs from 'fs';

const insultList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../insult.json'), 'utf8')) as string[];

const channelList = [config.channel['general-1'], config.channel['general-2']]; 

// <ChannelID, <UserId, MediaCount>>
const userMediaCount = new Collection<Snowflake, Collection<Snowflake, number>>();
// <ChannelID, <UserId, FirstPostTime>>
const userTimeMap = new Collection<Snowflake, Collection<Snowflake, Date>>();
// <UserId, WarnCount>
const userWarnCount = new Collection<Snowflake, number>(); // REMINDER: Change to something that can actually be saved past bot resets

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

    if (message.channel.id === config.channel["art-channel"] && message.attachments.size < 1) {
      GuildUtility.sendAuditLog({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              EmbedUtility.AUDIT_MESSAGE(
                message.author,
                `**${message.author} verbally warned for conversing in ${message.channel}**`
              ).setFooter({
                text: `User ID: ${message.author.id}`
              })
            )
          ]
      });
      message.author.send("Please do not send messages in the art channel, it is for posting art only.");
      message.delete(); // Assuming we get delete perms as thats the only way we can do this.
    }
    
    if (channelList.includes(message.channel.id) && message.attachments.size > 0) {
      const timeMap = userTimeMap.get(message.channel.id) || new Collection<Snowflake, Date>();
      const countMap = userMediaCount.get(message.channel.id) || new Collection<Snowflake, number>();

      const timePassed = timeMap.has(message.author.id)
        ? (new Date().getTime() - timeMap.get(message.author.id)!.getTime()) * 1000
        : null;

      const cooldownEnded = timePassed ? timePassed > config.misc.mediaCooldown : false;

      if (!timeMap.has(message.author.id) || cooldownEnded) timeMap.set(message.author.id, new Date());

      let mediaCount =
        (!countMap.has(message.author.id) || cooldownEnded ? 0 : countMap.get(message.author.id)!) +
        message.attachments.size;

      countMap.set(message.author.id, mediaCount);

      if (mediaCount > config.misc.mediaLimit) {
        !userWarnCount.has(message.author.id) ? userWarnCount.set(message.author.id, 1) : userWarnCount.set(message.author.id, userWarnCount.get(message.author.id) + 1);
        
        GuildUtility.sendAuditLog({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              EmbedUtility.AUDIT_MESSAGE(
                message.author,
                `**${message.author} verbally warned for surpassing media limit in ${message.channel}**`
              ).setFooter({
                text: `User ID: ${message.author.id}\nTimes warned: ${userWarnCount.get(message.author.id)}`
              })
            )
          ]
        });
          
        return message.author.send('Your limit for media have been exceeded. Please move to a more appropriate channel.');
        message.delete();
      }
    }
    // Translation function, may switch to moderator command only if the api gets overloaded.
    /*if (message.content.length > 7) { // Probably shouldn't be hard coded here 
    let transMessage = await translate(
      message.content,
      {
        from: "auto",
        to: "en"
      }
    );
    
    if (transMessage.from.language.iso !== "en")
      transMessage.text = transMessage.text.replace("@","[@]"); // Paranoia sanitizing (might change to regex but lazy)
      message.reply({
        content:`**Text translated from: ${transMessage.from.language.iso}**\n${transMessage.text}`,
        allowedMentions: {
          repliedUser: false
        }
      });*/
    
    if ( message.channel.id == config.channel["user-verification"] && message.content.indexOf("16") > -1 ) {
      GuildUtility.sendAuditLog({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              EmbedUtility.AUDIT_MESSAGE(
                message.author,
                `**${message.author} verbally warned for mentioning the age requirement**`
              ).setFooter({
                text: `User ID: ${message.author.id}`
              })
            )
          ]
        });
          
        return message.author.send('Do not mention the age requirement during verification.');
        message.delete();
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
