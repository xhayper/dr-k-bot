import { ActivityOptions, ActivityType, Client } from 'discord.js';
import { TypedEvent } from '../base/clientEvent';
import { CommandManager } from '..';
import { Logger } from '../logger';

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

export default TypedEvent({
  eventName: 'ready',
  on: async (client: Client) => {
    CommandManager.reloadCommands();

    setInterval(() => {
      client.user!.setActivity(randomStatus[Math.floor(Math.random() * randomStatus.length)]);
    }, 60000);

    Logger.info('Alright, Time to do some science.');
  }
});
