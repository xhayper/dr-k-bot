import { type Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedUtility } from '..';

@ApplyOptions<Command.Options>({
  description: 'Replies with the appeal button in current channel',
  preconditions: ['ChangedGuildOnly', ['HeadSecurityOnly', 'SeniorSecurityOnly', 'SecurityOnly', 'InternOnly']]
})
export class CommandHandler extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    await interaction.channel?.send({
      embeds: [EmbedUtility.BAN_APPEAL_BUTTON().toJSON()],
      components: [
        new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder({
              style: ButtonStyle.Success,
              label: 'Appeal',
              customId: 'appeal_ban'
            })
          ]
        })
      ]
    });

    await interaction.editReply({
      content: 'Appeal button sent!'
    });
  }

  public override async messageRun(message: Message) {
    if (message.deletable) await message.delete();
    return message.channel?.send({
      embeds: [EmbedUtility.BAN_APPEAL_BUTTON().toJSON()],
      components: [
        new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder({
              style: ButtonStyle.Success,
              label: 'Appeal',
              customId: 'appeal_ban'
            })
          ]
        })
      ]
    });
  }
}
