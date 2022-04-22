import { MessageEmbed, User } from 'discord.js';

export class EmbedUtility {
  ERROR_COLOR(embed: MessageEmbed): MessageEmbed {
    return embed.setColor('RED');
  }

  SUCCESS_COLOR(embed: MessageEmbed): MessageEmbed {
    return embed.setColor('GREEN');
  }

  USER_TITLE(embed: MessageEmbed, user: User): MessageEmbed {
    return this.TIMESTAMP_NOW(
      embed.setAuthor({
        name: `${user.tag}`,
        iconURL:
          user.avatarURL({
            size: 4096,
            dynamic: true
          }) || user.defaultAvatarURL
      })
    );
  }

  VERIFICATION_ALREADY_TAKEN(embed: MessageEmbed, user: User): MessageEmbed {
    return this.ERROR_COLOR(embed).setDescription(`${user.tag} is already working on this ticket!`);
  }

  TIMESTAMP_NOW(embed: MessageEmbed): MessageEmbed {
    return embed.setTimestamp(Date.now());
  }

  CANT_USE_HERE(): MessageEmbed {
    return this.ERROR_COLOR(new MessageEmbed().setDescription("You can't use that command here!"));
  }

  NO_PERMISSION(): MessageEmbed {
    return this.ERROR_COLOR(new MessageEmbed()).setDescription(`You do not have permission to use this command!`);
  }

  CANT_FIND_TICKET(): MessageEmbed {
    return this.ERROR_COLOR(new MessageEmbed()).setDescription(`I couldn't find the ticket! Maybe it was already handled?`);
  }
}
