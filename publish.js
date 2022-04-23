require('dotenv/config');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { Routes } = require('discord-api-types/v10');
const { REST } = require('@discordjs/rest');

// TODO: Intergrate this with the command handler themself

const verificationTicketIdOption = (option) => {
  return option.setName('id').setDescription('The ticket id').setRequired(true);
};

const command = [
  new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate javascript code')
    .addStringOption((option) => option.setName('code').setDescription('The code to evaluate').setRequired(true)),
  new SlashCommandBuilder().setName('nella').setDescription('-'),
  new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Verification ticket management')
    .addSubcommand((builder) =>
      builder.setName('accept').setDescription('-').addStringOption(verificationTicketIdOption)
    )
    .addSubcommand((builder) =>
      builder
        .setName('decline')
        .setDescription('-')
        .addStringOption(verificationTicketIdOption)
        .addStringOption((option) =>
          option.setName('reason').setDescription('The reason for declining the request').setRequired(true)
        )
    )
    .addSubcommand((builder) =>
      builder
        .setName('info')
        .setDescription('Show a specific verification ticket')
        .addStringOption(verificationTicketIdOption)
    )
    .addSubcommand((builder) => builder.setName('list').setDescription('Show unfinished verification tickets')),
  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a thread to ask for additional information')
    .addUserOption((option) => option.setName('user').setDescription('-').setRequired(true)),
  new SlashCommandBuilder().setName('sourcecode').setDescription("Give you the link to the bot's source code")
];

(async () => {
  const restClient = new REST().setToken(process.env.DISCORD_TOKEN);

  const user = await restClient.get(Routes.user());
  const guildList = await restClient.get(Routes.userGuilds());

  for (const guild of guildList) {
    const commandList = await restClient.get(Routes.applicationGuildCommands(user.id, guild.id));

    for (const command of commandList) {
      await restClient.delete(Routes.applicationGuildCommand(user.id, guild.id, command.id));
    }
  }

  const currentCommandList = await restClient.get(Routes.applicationCommands(user.id));

  for (const command of currentCommandList) {
    await restClient.delete(Routes.applicationCommand(user.id, command.id));
  }

  restClient.put(Routes.applicationCommands(user.id), {
    body: command.map((builder) => builder.toJSON())
  });
})();
