import { reply } from '@sapphire/plugin-editable-commands';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
  description: '-'
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputInteraction) {
    await interaction.deferReply();

    return interaction.reply(
      'https://media.discordapp.net/attachments/1020605730484670524/1022079784748077158/Screenshot_20220921_163737.png'
    );
  }

  public override async messageRun(message: Message) {
    return reply(
      message,
      'https://media.discordapp.net/attachments/1020605730484670524/1022079784748077158/Screenshot_20220921_163737.png'
    );
  }
}
