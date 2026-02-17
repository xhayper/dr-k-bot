import { Utility } from "@sapphire/plugin-utilities-store";
import { type User, EmbedBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Ticket } from "./ticketUtility";

@ApplyOptions<Utility.Options>({
  name: "embed"
})
export class EmbedUtility extends Utility {
  public ERROR_COLOR(embed: EmbedBuilder): EmbedBuilder {
    return embed.setColor(0xed4245);
  }

  public SUCCESS_COLOR(embed: EmbedBuilder): EmbedBuilder {
    return embed.setColor(0x57f287);
  }

  public USER_AUTHOR(embed: EmbedBuilder, user: User): EmbedBuilder {
    return embed.setAuthor({
      name: `${user.username}`,
      iconURL:
        user.avatarURL({
          size: 4096
        }) ?? user.defaultAvatarURL
    });
  }

  public VERIFICATION_ALREADY_TAKEN(embed: EmbedBuilder, user: User): EmbedBuilder {
    return this.ERROR_COLOR(embed).setDescription(`${user} is already working on this ticket!`);
  }

  public VERIFICATION_BUTTON(): EmbedBuilder {
    return this.SUCCESS_COLOR(
      new EmbedBuilder().setDescription(`Click the button below to start the verification process!`)
    );
  }

  public BAN_APPEAL_BUTTON(): EmbedBuilder {
    return this.SUCCESS_COLOR(
      new EmbedBuilder()
        .setDescription(`Please click the button below to start your appeal! The appeal will then be looked at by the main-server staff as quick as possible! 

***Please have your DM's open to know the result!*** 💜`)
    );
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

  public VERIFICATION_SUCCESS(): EmbedBuilder {
    return this.SUCCESS_COLOR(new EmbedBuilder())
      .setTitle("All done!")
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
    return this.ERROR_COLOR(new EmbedBuilder({ description: "I have cancelled the operation!" }));
  }

  public async VERIFICATION_INFO(data: Ticket): Promise<EmbedBuilder> {
    const targetUser = await this.container.client.users.fetch(data.discordId);

    const baseEmbed = new EmbedBuilder();

    baseEmbed.setColor(16776960);
    baseEmbed.addFields([
      {
        name: `Ticket Information`,
        value: `**User**: ${targetUser.username}\n**User Id**: ${targetUser.id}\n**Account creation date**: <t:${Math.round(
          targetUser.createdTimestamp / 1000
        )}>\n**Ticket ID**: ${data.id}`
      },
      ...data.answers.map((answerData) => ({
        name: answerData.question,
        value: answerData.answer,
        inline: true
      }))
    ]);
    baseEmbed.setThumbnail(targetUser.displayAvatarURL({ size: 4096 }) ?? targetUser.defaultAvatarURL);

    return baseEmbed;
  }

  public BAN_APPEAL_INFO(data: { appealer: User; answers: { question: string; answer: string }[] }): EmbedBuilder {
    const baseEmbed = new EmbedBuilder();

    baseEmbed.setColor(16776960);
    baseEmbed.addFields([
      {
        name: `Ban Appeal Information`,
        value: `**Appealer**: ${data.appealer.username}\n**User Id**: ${data.appealer.id}`
      },
      ...Object.values(
        data.answers.map((answerData) => ({
          name: answerData.question,
          value: answerData.answer,
          inline: true
        }))
      )
    ]);
    baseEmbed.setThumbnail(data.appealer.displayAvatarURL({ size: 4096 }) ?? data.appealer.defaultAvatarURL);

    return baseEmbed;
  }
}

declare module "@sapphire/plugin-utilities-store" {
  export interface Utilities {
    embed: EmbedUtility;
  }
}
