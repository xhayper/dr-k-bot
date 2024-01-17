import { type BaseMessageOptions } from 'discord.js';

export class EmbedUtility {
  // TODO: Move to MessageUtility in near future
  public static deleteComponent(payload: BaseMessageOptions): BaseMessageOptions {
    return {
      content: payload.content,
      embeds: payload.embeds,
      files: payload.files,
      allowedMentions: payload.allowedMentions
    };
  }

  public deleteComponent(payload: BaseMessageOptions): BaseMessageOptions {
    return EmbedUtility.deleteComponent(payload);
  }
}
