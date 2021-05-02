import Shard from './src/Shard';
import EnvLoader from './src/utils/EnvLoader';
import Logger from './src/utils/Logger';

(async () => {
    new EnvLoader(__dirname + '/../.env').loadFile().then(() => {
        const logger = new Logger(
            process.env.debug !== undefined ? process.env.debug == 'true' : false,
            process.env.enableHook !== undefined ? process.env.enableHook == 'true' : false,
            process.env.hookID,
            process.env.hookSecret,
        );
        //emit error without crashing code
        process.on('unhandledRejection', (err: Error) => {
            logger.error(err.stack);
        });
        return new Shard(logger, process.env.token as string, 'commands', 'events', true);
    });
})();
