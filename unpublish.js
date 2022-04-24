require('dotenv/config');
const { Routes } = require('discord-api-types/v10');
const { REST } = require('@discordjs/rest');

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
})();
