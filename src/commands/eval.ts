import { reply } from '@sapphire/plugin-editable-commands';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { Message } from 'discord.js';
import { inspect } from 'node:util';

const clean = async (text: any) => {
  if (text && text.constructor.name == 'Promise') text = await text;

  if (typeof text !== 'string') text = inspect(text, { depth: 1 });

  text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));

  return text;
};

@ApplyOptions<Command.Options>({
  description: '-',
  preconditions: ['BotOwnerOnly']
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((input) => input.setName('code').setDescription('-').setRequired(true))
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const code = interaction.options.getString('code', true);

    try {
      const result = await clean(eval(code));
      interaction.editReply(`\`\`\`\n${result}\n\`\`\`` ?? 'No output');
    } catch (e: any) {
      interaction.editReply(`\`\`\`\n${await clean(e)}\n\`\`\``);
    }
  }

  public override async messageRun(message: Message, args: Args) {
    const code = await args.rest('string').catch(() => '');

    try {
      const result = await clean(eval(code));
      reply(message, `\`\`\`\n${result}\n\`\`\`` ?? 'No output');
    } catch (e: any) {
      reply(message, `\`\`\`\n${await clean(e)}\n\`\`\``);
    }
  }
}
