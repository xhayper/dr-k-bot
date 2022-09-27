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
    await interaction.deferReply({ephemeral: true});
    
    return interaction.reply('https://github.com/xhayper/dr-k-bot');
  }

  public override async messageRun(message: Message) {
    return reply(message, 'https://github.com/xhayper/dr-k-bot');
  }
}
