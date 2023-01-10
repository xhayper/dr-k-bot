import { type Message, type Snowflake, ChannelType, Collection, DiscordAPIError } from 'discord.js';
import { EmbedUtility, GuildUtility } from '..';
import { Listener } from '@sapphire/framework';
import config from '../config';
import path from 'node:path';
import fs from 'node:fs';

const insultList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../insult.json'), 'utf8')) as string[];

const channelList = [config.channel['general-1'], config.channel['general-2']];

// <ChannelID, <UserId, MediaCount>>
const userMediaCount = new Collection<Snowflake, Collection<Snowflake, number>>();
// <ChannelID, <UserId, FirstPostTime>>
const userTimeMap = new Collection<Snowflake, Collection<Snowflake, Date>>();
// <UserId, WarnCount>
const userWarnCount = new Collection<Snowflake, number>(); // REMINDER: Change to something that can actually be saved past bot resets

const urlRegEx = /(?:http\:|www\.|https\:)/gi;
const mediaRegEx = /(?:http\:|www\.|https\:)(?:.*\.gif|.*\.png|.*\.mp4|.*\.jpg|.*\.jpeg|.*\.webm)/gi;

export class UserEvent extends Listener {
  public async run(message: Message) {
    const splitText = message.content.split(' ');
    if (
      message.mentions.users.size === 1 &&
      splitText.length === 1 &&
      [`<@${this.container.client.user!.id}>`, `<@!${this.container.client.user!.id}>`].some(
        (mentionText) => splitText[0] === mentionText
      )
    ) {
      return await message.reply({
        content: insultList[Math.floor(Math.random() * insultList.length)],
        allowedMentions: {
          repliedUser: false
        }
      });
    }

    if (message.author.bot || message.channel.type != ChannelType.GuildText) return;

    if (message.channel.id === config.channel['art-channel']) {
      if (!(0 < message.attachments.size || urlRegEx.test(message.content))) {
        GuildUtility.sendAuditLog({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              EmbedUtility.AUDIT_MESSAGE(
                message.author,
                `**${message.author} verbally warned for conversing in ${message.channel}**`
              )
            ).toJSON()
          ]
        });

        const err = await message.author
          .send('Please do not send messages in the art channel, it is for posting art only.')
          .catch((err) => err);

        if (err instanceof DiscordAPIError) {
          if (err.code === 50007) {
            const msg = await message
              .reply({
                content: 'Please do not send messages in the art channel, it is for posting art only.',
                allowedMentions: {
                  repliedUser: true
                }
              })
              .catch(() => null);

            if (msg)
              setTimeout(() => {
                msg.delete();
              }, 3000);
          }
        }

        return message.delete();
      }
    }

    if (
      channelList.includes(message.channel.id) &&
      (message.attachments.size > 0 || mediaRegEx.test(message.content))
    ) {
      const timeMap = userTimeMap.get(message.channel.id) ?? new Collection<Snowflake, Date>();
      const countMap = userMediaCount.get(message.channel.id) ?? new Collection<Snowflake, number>();

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
        userWarnCount.set(message.author.id, (userWarnCount.get(message.author.id) || 0) + 1);

        GuildUtility.sendAuditLog({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              EmbedUtility.AUDIT_MESSAGE(
                message.author,
                `**${message.author} verbally warned for surpassing media limit in ${message.channel}**`
              ).setFooter({
                text: `Times warned: ${userWarnCount.get(message.author.id)}`
              })
            ).toJSON()
          ]
        });

        await message.reply('Your limit for media have been exceeded. Please move to a more appropriate channel.');
        return message.delete();
      }
    }
  }
}
