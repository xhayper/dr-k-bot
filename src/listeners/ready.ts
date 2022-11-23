import { type ActivityOptions } from 'discord.js';
import { Listener } from '@sapphire/framework';

const randomStatus: ActivityOptions[] = [
  {
    type: 'WATCHING',
    name: 'the experiment'
  },
  {
    type: 'PLAYING',
    name: 'with the test subjects'
  },
  {
    type: 'LISTENING',
    name: 'to the test result'
  }
];

export class UserEvent extends Listener {
  public run() {
    const updateActivity = () => {
      this.container.client.user!.setActivity(randomStatus[Math.floor(Math.random() * randomStatus.length)]);
    };

    updateActivity();
    setInterval(updateActivity, 60000);

    this.container.logger.info('Alright, Time to do some science.');
  }
}
