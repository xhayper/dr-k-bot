import { type ActivityOptions, ActivityType } from "discord.js";
import { Listener } from "@sapphire/framework";

const randomStatus: ActivityOptions[] = [
  {
    type: ActivityType.Watching,
    name: "the experiment"
  },
  {
    type: ActivityType.Playing,
    name: "with the test subjects"
  },
  {
    type: ActivityType.Listening,
    name: "to the test result"
  }
];

export class ClientReadyEvent extends Listener {
  public async run() {
    await this.container.utilities.guild.load();
    await this.container.utilities.message.load();
    await this.container.utilities.ticket.load();

    const updateActivity = () => {
      this.container.client.user!.setActivity(randomStatus[Math.floor(Math.random() * randomStatus.length)]);
    };

    updateActivity();
    setInterval(updateActivity, 60000);

    this.container.logger.info("Alright, Time to do some science.");
  }
}
