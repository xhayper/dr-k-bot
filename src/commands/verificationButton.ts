import { Message, MessageActionRow, MessageButton, MessageButtonOptions } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedUtility } from '..';
import { ButtonStyle } from 'discord-api-types/v10';

@ApplyOptions<Command.Options>({
  description: 'Replies with the verification button in current channel',
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

  public override async chatInputRun(interaction: Command.ChatInputInteraction) {
    await interaction.deferReply({ ephemeral: true });

    await interaction.channel?.send({
      embeds: [EmbedUtility.VERIFICATION_BUTTON().toJSON()],
      components: [
        new MessageActionRow<MessageButton>({
          components: [
            new MessageButton({
              style: 'SUCCESS',
              label: 'Verify',
              customId: 'verify'
            })
          ]
        })
      ]
    });

    await interaction.deleteReply();
  }

  public override async messageRun(message: Message) {
    if (message.deletable) await message.delete();
    return message.channel?.send({
      embeds: [EmbedUtility.VERIFICATION_BUTTON().toJSON()],
      components: [
        new MessageActionRow<MessageButton>({
          components: [
            new MessageButton({
              style: 'SUCCESS',
              label: 'Verify',
              customId: 'verify'
            })
          ]
        })
      ]
    });
  }
}
