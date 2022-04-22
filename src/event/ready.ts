import { ActivityOptions, Client } from 'discord.js';
import { TypedEvent } from '../base/clientEvent';
import { CommandManager } from '..';

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

export default TypedEvent({
  eventName: 'ready',
  on: async (client: Client) => {
    CommandManager.reloadCommands();

    client.user!.setActivity(randomStatus[Math.floor(Math.random() * randomStatus.length)]);

    console.log('Alright, Time to do some science.');
  }
});
