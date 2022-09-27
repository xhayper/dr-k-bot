import type { CommandInteraction, ContextMenuInteraction, Message } from 'discord.js';
import { AllFlowsPrecondition } from '@sapphire/framework';
import { GuildUtility } from '..';

export class UserPrecondition extends AllFlowsPrecondition {
  public override async messageRun(message: Message) {
    return this.checkUser(message.author.id);
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    return this.checkUser(interaction.user.id);
  }

  public override async contextMenuRun(interaction: ContextMenuInteraction) {
    return this.checkUser(interaction.user.id);
  }

  private async checkUser(id: string) {
    const guildMember = await GuildUtility.getGuildMember(id);
    return guildMember && GuildUtility.isHeadSecurity(guildMember) ? this.ok() : this.error();
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    HeadSecurityOnly: never;
  }
}
