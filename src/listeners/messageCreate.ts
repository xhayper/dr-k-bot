import { HttpUrlRegex } from '@sapphire/discord-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { type Message } from 'discord.js';

@ApplyOptions<Listener.Options>({
  event: 'messageCreate'
})
export class MessageCreateListener extends Listener {
  public async run(message: Message<true>) {
    if (message.channelId !== this.container.config.channels.verification) return;
    if (!message.member) return;
    if (!HttpUrlRegex.test(message.content)) return;
    if (this.container.utilities.guild.isSecurity(message.member.roles)) return;

    await message.delete();
  }
}
