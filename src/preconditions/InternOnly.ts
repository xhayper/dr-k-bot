import { type CommandInteraction, type ContextMenuCommandInteraction, type Message } from 'discord.js';
import { AllFlowsPrecondition } from '@sapphire/framework';
import { GuildUtility } from '..';

export class UserPrecondition extends AllFlowsPrecondition {
  public override async messageRun(message: Message) {
    return this.checkUser(message.author.id);
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    return this.checkUser(interaction.user.id);
  }

  public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.checkUser(interaction.user.id);
  }

  private async checkUser(id: string) {
    const guildMember = await GuildUtility.getGuildMember(id);
    return guildMember && GuildUtility.isIntern(guildMember) ? this.ok() : this.error();
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    InternOnly: never;
  }
}
