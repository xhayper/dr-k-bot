import { MessageEmbed, User } from 'discord.js';

export class EmbedUtility {
  ERROR_COLOR(embed: MessageEmbed): MessageEmbed {
    return embed.setColor('RED');
  }

  SUCCESS_COLOR(embed: MessageEmbed): MessageEmbed {
    return embed.setColor('GREEN');
  }

  AUDIT_LOG(embed: MessageEmbed, user: User): MessageEmbed {
    return this.TIMESTAMP_NOW(
      this.SUCCESS_COLOR(embed).setAuthor({
        name: `${user.tag}`,
        iconURL:
          user.avatarURL({
            size: 4096,
            dynamic: true
          }) || user.defaultAvatarURL
      })
    );
  }

  TIMESTAMP_NOW(embed: MessageEmbed): MessageEmbed {
    return embed.setTimestamp(Date.now());
  }

  CANT_USE_HERE(): MessageEmbed {
    return this.ERROR_COLOR(new MessageEmbed().setTitle('Hey!').setDescription("You can't use that command here!"));
  }

  NO_PERMISSION(): MessageEmbed {
    return this.ERROR_COLOR(new MessageEmbed())
      .setTitle('Hey!')
      .setDescription(`You do not have permission to use this command!`);
  }
}
