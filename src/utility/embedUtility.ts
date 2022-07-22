import { PartialVerificationData } from './verifiationUtility';
import { Client, Colors, EmbedBuilder, User } from 'discord.js';

export class EmbedUtility {
  #client: Client;

  constructor(client: Client) {
    this.#client = client;
  }

  ERROR_COLOR(embed: EmbedBuilder): EmbedBuilder {
    return embed.setColor(Colors.Red);
  }

  SUCCESS_COLOR(embed: EmbedBuilder): EmbedBuilder {
    return embed.setColor(Colors.Green);
  }

  USER_AUTHOR(embed: EmbedBuilder, user: User): EmbedBuilder {
    return embed.setAuthor({
      name: `${user.tag}`,
      iconURL:
        user.avatarURL({
          size: 4096,
          extension: "png"
        }) || user.defaultAvatarURL
    });
  }

  VERIFICATION_ALREADY_TAKEN(embed: EmbedBuilder, user: User): EmbedBuilder {
    return this.ERROR_COLOR(embed).setDescription(`${user} is already working on this ticket!`);
  }

  TIMESTAMP_NOW(embed: EmbedBuilder): EmbedBuilder {
    return embed.setTimestamp(Date.now());
  }

  CANT_USE_HERE(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder().setDescription("You can't use that command here!"));
  }

  NO_PERMISSION(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(`You do not have permission to use this command!`);
  }

  CANT_FIND_TICKET(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(`I couldn't find the ticket!`);
  }

  CANT_DM(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(
      `I can't seem to send you a Direct Message, Please check your privacy settings!`
    );
  }

  DIDNT_RESPOND_IN_TIME(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(`You didn't respond in time!`);
  }

  VERIFICATION_SUCCESS(ticketId: string): EmbedBuilder {
    return this.SUCCESS_COLOR(new EmbedBuilder())
      .setTitle('All done!')
      .setDescription(`Thank you for your submission!`); //\n Your ticket id is **${ticketId}**!`);
  }

  CANT_FIND_USER(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(`I couldn't find the user!`);
  }

  ALREADY_IN_SESSION(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(`You are already in a session!`);
  }

  AUDIT_MESSAGE(user: User, description: string): EmbedBuilder {
    return this.USER_AUTHOR(this.TIMESTAMP_NOW(new EmbedBuilder({ description: description })), user);
  }

  OPERATION_CANCELLED(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder({ description: 'I have cancelled the operation!' }));
  }

  async VERIFICATION_INFO(data: PartialVerificationData): Promise<EmbedBuilder> {
    const targetUser = await this.#client.users.fetch(data.requesterDiscordId);

    const baseEmbed = new EmbedBuilder();
    baseEmbed.addFields([{
      name: `Ticket Information`,
      value: `**User**: ${targetUser.tag}\n**Account creation date**: <t:${Math.round(
        targetUser.createdTimestamp / 1000
      )}>\n**Ticket ID**: ${data.id}`
    }, ...Object.values(data.answers).map(answerData => ({
      name: answerData.question,
      value: answerData.answer,
      inline: true
    }))
    ]);

    baseEmbed.setThumbnail(targetUser.displayAvatarURL({ extension: "png", size: 4096 }) || targetUser.defaultAvatarURL);

    return this.SUCCESS_COLOR(baseEmbed);
  }
}
