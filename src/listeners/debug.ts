import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
  event: 'debug'
})
export class DebugListener extends Listener {
  public async run(...args: unknown[]) {
    const { logger } = this.container;

    logger.debug('Debug:', ...args);
  }
}
