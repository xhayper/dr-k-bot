import { PartialVerificationData } from './verifiationUtility';
import { Client, MessageEmbed, User } from 'discord.js';

export class EmbedUtility {
  #client: Client;

  constructor(client: Client) {
    this.#client = client;
  }

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
      `I can't seem to send you a Direct Message, Please check your privacy settings!`
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

  AUDIT_MESSAGE(user: User, description: string): MessageEmbed {
    return this.USER_AUTHOR(this.TIMESTAMP_NOW(new MessageEmbed({ description: description })), user);
  }

  OPERATION_CANCELLED(): MessageEmbed {
    return this.ERROR_COLOR(new MessageEmbed({ description: 'I have cancelled the operation!' }));
  }

  async VERIFICATION_INFO(data: PartialVerificationData): Promise<MessageEmbed> {
    const targetUser = await this.#client.users.fetch(data.requesterDiscordId);

    const baseEmbed = new MessageEmbed();
    baseEmbed.addField(
      `Ticket Information`,
      `**User**: ${targetUser.tag}\n**Account creation date**: <t:${Math.round(
        targetUser.createdTimestamp / 1000
      )}>\n**Ticket ID**: ${data.id}`
    );

    baseEmbed.setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 4096 }) || targetUser.defaultAvatarURL);

    for (const answerData of Object.values(data.answers)) {
      baseEmbed.addField(answerData.question, answerData.answer, true);
    }

    return this.SUCCESS_COLOR(baseEmbed);
  }
}
