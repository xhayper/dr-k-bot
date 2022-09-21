import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import config from '../config';

export default {
    data: new SlashCommandBuilder().setName('parkie').setDescription('-'),
    guildId: [config.guildId],
    execute: (chatInputCommandInteraction: ChatInputCommandInteraction) => {
        chatInputCommandInteraction.editReply("https://media.discordapp.net/attachments/1020605730484670524/1022079784748077158/Screenshot_20220921_163737.png");
    }
} as SlashCommand;
