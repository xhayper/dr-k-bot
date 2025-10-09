import { type CommandInteraction, type ContextMenuCommandInteraction, type Message } from "discord.js";
import { AllFlowsPrecondition } from "@sapphire/framework";

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
    const guildMember = await this.container.utilities.guild.getGuildMember(id);
    return guildMember && this.container.utilities.guild.isSeniorSecurity(guildMember) ? this.ok() : this.error();
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    SeniorSecurityOnly: never;
  }
}
