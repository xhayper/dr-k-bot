import { type CommandInteraction, type ContextMenuInteraction, type Message } from 'discord.js';
import { AllFlowsPrecondition } from '@sapphire/framework';
import config from '../config';

export class UserPrecondition extends AllFlowsPrecondition {
  public override async messageRun(message: Message) {
    return this.checkGuild(message.guildId || '');
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    return this.checkGuild(interaction.guildId || '');
  }

  public override async contextMenuRun(interaction: ContextMenuInteraction) {
    return this.checkGuild(interaction.guildId || '');
  }

  private async checkGuild(id: string) {
    return id === config.guildId ? this.ok() : this.error();
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    ChangedGuildOnly: never;
  }
}
