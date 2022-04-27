import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import { EmbedUtility, GuildUtility } from '..';
import config from '../config';

export default {
  data: new SlashCommandBuilder()
      .setName("options")
      .setDescription('Adjust Dr. K bot options.')
    /*.addSubcommand((sub) =>
        sub
          .setName('removeFilter')
          .setDescription('Removes one of the chat filters.')
          .addStringOption((option) =>
            option
            .setName('filter')
            .setDescription('-')
            .addChoices(config.misc.chatFilters.map((filter) => ({ name: filter, value: filter })))
            .setRequired(true)
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName('addFilter')
          .setDescription('Adds a chat filter.')
          .addStringOption((option) =>
            option
            .setName('filter')
            .setDescription('-')
            .setRequired(true)
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName('showFilters')
          .setDescription('Shows all chat filters.')
      ) */
      .addSubcommand((sub) =>
        sub
          .setName('setUserMedia')
          .setDescription('Sets the media limit for each user.')
          .addIntegerOption((option) =>
            option
            .setName('timer')
            .setDescription('In minutes')
            .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
            .setName('messageCount')
            .setDescription('-')
            .setRequired(true)
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName('dashboard')
          .setDescription('Shows the option information dashboard.')
      )
      .addSubcommand((sub) =>
        sub
          .setName('killSwitch') // Probably should restrict to head mods and bot owners only
          .setDescription('Deactivates auto moderation and verification capabilities until toggled back on.')
      ),
  guildId: [config.guildId],
  permission: 'MODERATOR',
  execute: async (commandInteraction: CommandInteraction) => {
    
    const subCommand = commandInteraction.options.getSubcommand(true);
    
     switch (subCommand) {
      /* case 'removeFilter':
         case 'addFilter':
           config.misc.chatFilters.push(commandInteraction.options.getString('filter', true)); // Sanitizing probably needed
           await interaction.reply(
             {
              embeds: [
                EmbedUtility.SUCCESS_COLOR(
                  new MessageEmbed()
                  .setTitle("Success!")
                  .setDescription("Filter successfully added!")
                )
              ]
            }
           ).catch(() => undefined);
           break;
         case 'showFilters':
           await interaction.reply(
             {
              embeds: [
                EmbedUtility.SUCCESS_COLOR(
                  new MessageEmbed()
                  .setTitle("Filters")
                  .setDescription("```" + config.misc.chatFilters.join(", ") + "```")
                )
              ]
            }
           ).catch(() => undefined);
           break; */
         case 'setUserMedia':
	   config.misc.mediaLimit = commandInteraction.options.getString('messageCount', true);
	   config.misc.mediaTimer = commandInteraction.options.getString('timer', true);
	   await interaction.reply(
             {
              embeds: [
                EmbedUtility.SUCCESS_COLOR(
                  new MessageEmbed()
                  .setTitle("Success!")
                  .setDescription("Media settings successfully changed!")
                )
              ]
            }
           ).catch(() => undefined);
	   break;
         case 'dashboard':
           await interaction.reply(
             {
              embeds: [
                EmbedUtility.SUCCESS_COLOR(
                  new MessageEmbed()
                  .setTitle("Dashboard")
                  .setDescription("Information dashboard for Dr. K bot.")
                  .addFields(
		    // { name: 'Chat filters', value: "```" + config.misc.chatFilters.join(", ") + "```" },
                    { name: 'Status', value: "```" + (!config.misc.killSwitch ? "Active" : "Disabled") + "```" },
                    { name: 'Media Timer', value: config.misc.mediaTimer, inline: true },
                    { name: 'Media Limit', value: config.misc.mediaLimit, inline: true }
	                )
                )
              ]
            }
           ).catch(() => undefined);
           break;
         case 'killSwitch':
           config.misc.killSwitch ? config.misc.killSwitch = "false" : config.misc.killSwitch = "true";
           await interaction.reply(
             {
              embeds: [
                EmbedUtility.SUCCESS_COLOR(
                  new MessageEmbed()
                  .setTitle("Success!")
                  .setDescription("Kill switch set to "+config.misc.killSwitch)
                )
              ]
            }
           ).catch(() => undefined);
           break;
  }
} as SlashCommand;
