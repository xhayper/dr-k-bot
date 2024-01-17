import { HttpUrlRegex } from '@sapphire/discord-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { type Message } from 'discord.js';

@ApplyOptions<Listener.Options>({
  event: 'messageCreate'
})
export class MessageCreateListener extends Listener {
  public async run(message: Message<true>) {
    if (message.content === 'k!test') {
      const messageComponentList = [];

      if (this.container.config.declineReasonPreset && this.container.config.declineReasonPreset.length > 0) {
        messageComponentList.push({
          type: 1,
          components: [
            {
              type: 3,
              custom_id: 'verification_request_decline_preset',
              placeholder: 'Choose a pre-defined decline reason',
              options: this.container.config.declineReasonPreset!.map((data, index) => ({
                label: data.label,
                value: index.toString(),
                description: data.description,
                emoji: data.emoji
              }))
            }
          ]
        });
      }

      messageComponentList.push({
        type: 1,
        components: [
          {
            type: 2,
            style: 3,
            label: 'Accept',
            custom_id: 'verification_request_accept'
          },
          {
            type: 2,
            style: 4,
            label: 'Decline',
            custom_id: 'verification_request_decline'
          }
        ]
      });

      message.channel.send({
        embeds: [
          {
            title: 'Test',
            description: 'Test'
          }
        ],
        components: messageComponentList
      });

      return;
    }

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
