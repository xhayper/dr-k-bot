import { Utility } from "@sapphire/plugin-utilities-store";
import { type PartialUser, type User } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import config from "../config";

@ApplyOptions<Utility.Options>({
  name: "user"
})
export class UserUtility extends Utility {
  public isBotOwner(user: User | PartialUser): boolean {
    return config.user.botOwner.includes(user.id);
  }
}

declare module "@sapphire/plugin-utilities-store" {
  export interface Utilities {
    user: UserUtility;
  }
}
