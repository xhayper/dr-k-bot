import { reply } from '@sapphire/plugin-editable-commands';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { type Message } from 'discord.js';
import { wikiClient } from '..';

@ApplyOptions<Command.Options>({
  description: 'Query the wiki!'
})
export class CommandHandler extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option.setName('query').setDescription('The query to search for.').setRequired(true)
        )
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const query = interaction.options.getString('query', true);

    const queryResult = await wikiClient.search(query, undefined, [
      'snippet',
      'redirecttitle',
      'sectiontitle',
      'redirectsnippet',
      'titlesnippet',
      'sectionsnippet',
      'categorysnippet'
    ]);

    if (0 >= queryResult.length) {
      return interaction.editReply('No results found.');
    }

    // TODO: Add domain to config
    return interaction.editReply(
      `${'https://changed.fandom.com'}/wiki/${encodeURI(queryResult[0].title.split(' ').join('_'))}`
    );
  }

  public override async messageRun(message: Message, args: Args) {
    const query = await args.rest('string');

    const queryResult = await wikiClient.search(query, undefined, [
      'snippet',
      'redirecttitle',
      'sectiontitle',
      'redirectsnippet',
      'titlesnippet',
      'sectionsnippet',
      'categorysnippet'
    ]);

    if (0 >= queryResult.length) {
      return reply(message, 'No results found.');
    }

    // TODO: Add domain to config
    return reply(
      message,
      `${'https://changed.fandom.com'}/wiki/${encodeURI(queryResult[0].title.split(' ').join('_'))}`
    );
  }
}
