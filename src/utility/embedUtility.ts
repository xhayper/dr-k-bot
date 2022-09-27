import { PartialVerificationData } from './verifiationUtility';
import { SapphireClient } from '@sapphire/framework';
import { EmbedBuilder } from '@discordjs/builders';
import { User } from 'discord.js';

export class EmbedUtility {
  private client: SapphireClient;

  constructor(client: SapphireClient) {
    this.client = client;
  }

  public ERROR_COLOR(embed: EmbedBuilder): EmbedBuilder {
    return embed.setColor(0xed4245);
  }

  public SUCCESS_COLOR(embed: EmbedBuilder): EmbedBuilder {
    return embed.setColor(0x57f287);
  }

  public USER_AUTHOR(embed: EmbedBuilder, user: User): EmbedBuilder {
    return embed.setAuthor({
      name: `${user.tag}`,
      iconURL:
        user.avatarURL({
          size: 4096,
          dynamic: true
        }) || user.defaultAvatarURL
    });
  }

  public VERIFICATION_ALREADY_TAKEN(embed: EmbedBuilder, user: User): EmbedBuilder {
    return this.ERROR_COLOR(embed).setDescription(`${user} is already working on this ticket!`);
  }

  public TIMESTAMP_NOW(embed: EmbedBuilder): EmbedBuilder {
    return embed.setTimestamp(Date.now());
  }

  public CANT_USE_HERE(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder().setDescription("You can't use that command here!"));
  }

  public NO_PERMISSION(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(`You do not have permission to use this command!`);
  }

  public CANT_FIND_TICKET(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(`I couldn't find the ticket!`);
  }

  public CANT_DM(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(
      `I can't seem to send you a Direct Message, Please check your privacy settings!`
    );
  }

  public DIDNT_RESPOND_IN_TIME(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(`You didn't respond in time!`);
  }

  public VERIFICATION_SUCCESS(ticketId: string): EmbedBuilder {
    return this.SUCCESS_COLOR(new EmbedBuilder())
      .setTitle('All done!')
      .setDescription(`Thank you for your submission!`); //\n Your ticket id is **${ticketId}**!`);
  }

  public CANT_FIND_USER(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(`I couldn't find the user!`);
  }

  public ALREADY_IN_SESSION(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder()).setDescription(`You are already in a session!`);
  }

  public AUDIT_MESSAGE(user: User, description: string): EmbedBuilder {
    return this.USER_AUTHOR(this.TIMESTAMP_NOW(new EmbedBuilder({ description: description })), user);
  }

  public OPERATION_CANCELLED(): EmbedBuilder {
    return this.ERROR_COLOR(new EmbedBuilder({ description: 'I have cancelled the operation!' }));
  }

  public async VERIFICATION_INFO(data: PartialVerificationData): Promise<EmbedBuilder> {
    const targetUser = await this.client.users.fetch(data.discordId);

    const baseEmbed = new EmbedBuilder();
    baseEmbed.addFields([
      {
        name: `Ticket Information`,
        value: `**User**: ${targetUser.tag}\n**Account creation date**: <t:${Math.round(
          targetUser.createdTimestamp / 1000
        )}>\n**Ticket ID**: ${data.id}`
      },
      ...(Object.values(JSON.parse(data.answers)) as { question: string; answer: string }[]).map((answerData) => ({
        name: answerData.question,
        value: answerData.answer,
        inline: true
      }))
    ]);

    baseEmbed.setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 4096 }) || targetUser.defaultAvatarURL);

    return this.SUCCESS_COLOR(baseEmbed);
  }
}
