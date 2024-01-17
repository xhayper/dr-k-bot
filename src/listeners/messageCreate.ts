import { HttpUrlRegex } from '@sapphire/discord-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { type Message } from 'discord.js';

@ApplyOptions<Listener.Options>({
  event: 'messageCreate'
})
export class MessageCreateListener extends Listener {
  public async run(message: Message<true>) {
    if (message.content === 'k!test2') {
      message.channel.send({
        embeds: [
          {
            title: 'Test',
            description: 'Test'
          }
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 3,
                label: 'Verify',
                custom_id: 'request_verification_button'
              }
            ]
          }
        ]
      });

      return;
    }

    if (message.channelId !== this.container.config.channels.verification) return;
    if (!message.member) return;
    if (!HttpUrlRegex.test(message.content)) return;
    if (this.container.utilities.guild.isSecurity(message.member.roles)) return;

    await message.delete();
  }
}
