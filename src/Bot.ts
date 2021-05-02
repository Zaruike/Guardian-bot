import Logger from './utils/Logger';
import { Intents } from 'discord.js';
import GuardianClient from './extend/structures/GuardianClient';
import Config from './config/config';

const logger = new Logger(
    process.env.debug !== undefined ? process.env.debug == 'true' : false,
    process.env.enableHook !== undefined ? process.env.enableHook == 'true' : false,
    process.env.hookID,
    process.env.hookSecret,
);

const client: GuardianClient = new GuardianClient({
    cmdPath: 'commands',
    eventPath: 'events',
    debug: true,
    restTimeOffset: 0,
    config: Config,
    langPath: 'lang',
    logger: logger,
    intents: new Intents(Intents.NON_PRIVILEGED),
    partials: ['CHANNEL'],
});

client.login(process.env.token as string).catch((error: Error) => {
    logger.error(`Invalid token ${error}`);
});

process.on('unhandledRejection', (error: Error) => {
    logger.error(error.message);
});
