import { type Message, type CommandInteraction, type ContextMenuCommandInteraction } from 'discord.js';
import { Precondition } from '@sapphire/framework';

export class HeadSecurityOnlyPrecondition extends Precondition {
  public override async messageRun(message: Message) {
    return this.checkRole(message);
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    return this.checkRole(interaction);
  }

  public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.checkRole(interaction);
  }

  private async checkRole(data: Message | CommandInteraction) {
    let isHeadSecurity = data.member !== null && this.container.utilities.guild.isHeadSecurity(data.member.roles);

    if (!isHeadSecurity) {
      return this.error({ message: 'Only head security can use this command.' });
    } else {
      return this.ok();
    }
  }
}
