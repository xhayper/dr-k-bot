import { type ActivityOptions, ActivityType } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';

const randomStatus: ActivityOptions[] = [
  {
    type: ActivityType.Watching,
    name: 'the experiment'
  },
  {
    type: ActivityType.Playing,
    name: 'with the test subjects'
  },
  {
    type: ActivityType.Listening,
    name: 'to the test result'
  }
];

@ApplyOptions<Listener.Options>({
  event: 'ready'
})
export class ReadyListener extends Listener {
  public async run() {
    await this.container.utilities.guild.init();

    const updateActivity = () => {
      const { client } = this.container;
      if (!client.isReady) return;
      client.user?.setActivity(randomStatus[Math.floor(Math.random() * randomStatus.length)]);
    };

    updateActivity();
    setInterval(updateActivity, 60000);

    this.container.logger.info('Alright, time to do some science.');
  }
}
