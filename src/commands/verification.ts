import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { Ticket } from "../utilities/ticketUtility";
import { container } from "@sapphire/framework";
import config from "../config";

const verificationTicketIdOption = (option: any) => {
  return option.setName("id").setDescription("The ticket id").setRequired(true);
};

const getTicketFromInteraction = async (
  interaction: Subcommand.ChatInputCommandInteraction
): Promise<Ticket | null> => {
  const ticket = await container.utilities.verification.getTicketFromId(interaction.options.getString("id", true));

  if (!ticket) {
    await interaction.editReply({
      embeds: [container.utilities.embed.CANT_FIND_TICKET().toJSON()]
    });

    return null;
  }

  return ticket;
};

const createVerificationListAttachment = (verificationTickets: Ticket[]): AttachmentBuilder => {
  return new AttachmentBuilder(
    Buffer.from(
      verificationTickets
        .map((ticket) => {
          return `User ID: ${ticket.discordId}
Ticket ID: ${ticket.id}
--------------------------------------------------
${ticket.answers.map((answer) => `${answer.question}: ${answer.answer}`).join("\n\n")}`;
        })
        .join("\n\n\n")
    ),
    { name: "verification-tickets.txt" }
  );
};

@ApplyOptions<Subcommand.Options>({
  description: "Verification ticket management",
  preconditions: ["ChangedGuildOnly", ["HeadSecurityOnly", "SeniorSecurityOnly", "SecurityOnly", "InternOnly"]],
  subcommands: [
    { name: "accept", chatInputRun: "chatInputAccept" },
    { name: "decline", chatInputRun: "chatInputDecline" },
    { name: "info", chatInputRun: "chatInputInfo" },
    { name: "list", chatInputRun: "chatInputList" }
  ]
})
export class CommandHandler extends Subcommand {
  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        (builder as any)
          .setName(this.name)
          .setDescription(this.description)
          .addSubcommand((builder: any) =>
            builder.setName("accept").setDescription("Accept a ticket").addStringOption(verificationTicketIdOption)
          )
          .addSubcommand((builder: any) =>
            builder
              .setName("decline")
              .setDescription("Decline a ticket")
              .addStringOption(verificationTicketIdOption)
              .addStringOption((option: any) =>
                option.setName("reason").setDescription("The reason for declining the request").setRequired(true)
              )
          )
          .addSubcommand((builder: any) =>
            builder
              .setName("info")
              .setDescription("Show a specific verification ticket")
              .addStringOption(verificationTicketIdOption)
          )
          .addSubcommand((builder: any) =>
            builder.setName("list").setDescription("Show unfinished verification tickets")
          ),
      {
        idHints: ["1425880754981965884"],
        guildIds: [config.guildId]
      }
    );
  }

  public async chatInputAccept(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const ticket = await getTicketFromInteraction(interaction);
    if (!ticket) return;

    const member = await this.container.utilities.guild.getGuildMember(ticket.discordId);

    if (!member)
      return interaction.editReply({
        embeds: [this.container.utilities.embed.CANT_FIND_USER().toJSON()]
      });

    await member.roles.remove(config.role.unverified);

    await this.container.utilities.verification.deleteTicket(ticket.id, {
      deleteType: "ACCEPTED",
      who: interaction.user
    });

    await interaction.editReply({
      embeds: [
        this.container.utilities.embed
          .SUCCESS_COLOR(new EmbedBuilder().setDescription(`${member.user} has been accepted!`))
          .toJSON()
      ]
    });

    await this.container.utilities.guild.sendWelcomeMessage(member);
  }

  public async chatInputDecline(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const ticket = await getTicketFromInteraction(interaction);
    if (!ticket) return;

    const reason = interaction.options.getString("reason", true);

    const user = await this.container.client.users.fetch(ticket.discordId).catch(() => undefined);

    if (user) {
      await user
        .send({
          embeds: [
            this.container.utilities.embed
              .ERROR_COLOR(
                new EmbedBuilder({
                  title: "Sorry!",
                  description: `Your verification request has been declined by ${interaction.user}\nReason: ${reason}`
                })
              )
              .toJSON()
          ]
        })
        .catch(() => undefined);
    }

    await this.container.utilities.verification.deleteTicket(ticket.id, {
      deleteType: "DECLINED",
      who: interaction.user
    });

    await interaction.editReply({
      embeds: [
        this.container.utilities.embed
          .SUCCESS_COLOR(
            new EmbedBuilder({
              description: `${user ?? "User"} has been declined!`
            })
          )
          .toJSON()
      ]
    });
  }

  public async chatInputInfo(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const ticket = await getTicketFromInteraction(interaction);
    if (!ticket) return;

    await interaction.editReply({
      embeds: [(await this.container.utilities.embed.VERIFICATION_INFO(ticket)).toJSON()]
    });
  }

  public async chatInputList(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const tickets = [...this.container.utilities.ticket.tickets.values()];

    if (!tickets.length) {
      return interaction.editReply("There are no verification tickets as of right now.");
    }

    await interaction.editReply({
      content: `There's currently ${tickets.length} verification ticket(s)!`,
      files: [createVerificationListAttachment(tickets)]
    });
  }
}
