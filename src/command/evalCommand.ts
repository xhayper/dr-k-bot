import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import { inspect } from 'node:util';
import config from '../config';

const clean = async (text: any) => {
    if (text && text.constructor.name == "Promise")
        text = await text;

    if (typeof text !== "string")
        text = inspect(text, { depth: 1 });

    text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));

    return text;
}

export default {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('-')
        .addStringOption((input) => input.setName('code').setDescription('-').setRequired(true)),
    guildId: [config.guildId],
    permission: 'BOT_OWNER',
    execute: async (chatInputCommandInteraction: ChatInputCommandInteraction) => {
        const code = chatInputCommandInteraction.options.getString('code', true);

        try {
            const result = await clean(eval(code));
            chatInputCommandInteraction.editReply(`\`\`\`\n${result}\n\`\`\`` ?? 'No output');
        } catch (e: any) {
            chatInputCommandInteraction.editReply(`\`\`\`\n${clean(e)}\n\`\`\``);
        }
    }
} as SlashCommand;
