import { MessageEmbed, User } from 'discord.js';

export class EmbedUtility {
  ERROR_COLOR(embed: MessageEmbed): MessageEmbed {
    return embed.setColor('RED');
  }

  SUCCESS_COLOR(embed: MessageEmbed): MessageEmbed {
    return embed.setColor('GREEN');
  }

  USER_AUTHOR(embed: MessageEmbed, user: User): MessageEmbed {
    return embed.setAuthor({
      name: `${user.tag}`,
      iconURL:
        user.avatarURL({
          size: 4096,
          dynamic: true
        }) || user.defaultAvatarURL
    });
  }

  VERIFICATION_ALREADY_TAKEN(embed: MessageEmbed, user: User): MessageEmbed {
    return this.ERROR_COLOR(embed).setDescription(`${user} is already working on this ticket!`);
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
    return this.ERROR_COLOR(new MessageEmbed()).setDescription(`I couldn't find the ticket!`);
  }

  CANT_DM(): MessageEmbed {
    return this.ERROR_COLOR(new MessageEmbed()).setDescription(
      `I can't seems to send you a Direct Message, Please check your privacy settings!`
    );
  }

  DIDNT_RESPOND_IN_TIME(): MessageEmbed {
    return this.ERROR_COLOR(new MessageEmbed()).setDescription(`You didn't respond in time!`);
  }

  VERIFICATION_SUCCESS(ticketId: string): MessageEmbed {
    return this.SUCCESS_COLOR(new MessageEmbed())
      .setTitle('All done!')
      .setDescription(`Thank you for your submission!\n Your ticket id is **${ticketId}**!`);
  }

  CANT_FIND_USER(): MessageEmbed {
    return this.ERROR_COLOR(new MessageEmbed()).setDescription(`I couldn't find the user!`);
  }

  ALREADY_IN_SESSION(): MessageEmbed {
    return this.ERROR_COLOR(new MessageEmbed()).setDescription(`You are already in a session!`);
  }
}
