"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const clientEvent_1 = require("../base/clientEvent");
const __1 = require("..");
const logger_1 = require("../logger");
const randomStatus = [
    {
        type: discord_js_1.ActivityType.Watching,
        name: 'the experiment'
    },
    {
        type: discord_js_1.ActivityType.Playing,
        name: 'with the test subjects'
    },
    {
        type: discord_js_1.ActivityType.Listening,
        name: 'to the test result'
    }
];
exports.default = (0, clientEvent_1.TypedEvent)({
    eventName: 'ready',
    on: async (client) => {
        await __1.CommandManager.reloadCommands();
        const updateActivity = () => {
            client.user.setActivity(randomStatus[Math.floor(Math.random() * randomStatus.length)]);
        };
        updateActivity();
        setInterval(updateActivity, 60000);
        logger_1.Logger.info('Alright, Time to do some science.');
    }
});
