import { Shard as S, ShardingManager } from 'discord.js';
import { LoggerInterface } from 'loggerInterface';
import { join } from 'path';

export default class Shard {
    private readonly _manager: ShardingManager;

    constructor(logger: LoggerInterface, token: string, cmdPath: string, eventPath: string, devMode: boolean) {
        if (!token || token.length === 0) {
            logger.error('Invalid token');
            process.exit(1);
        }
        this._manager = new ShardingManager(join(__dirname, 'Bot.js'), {
            token: token,
        });
        this._manager.spawn(this._manager.totalShards, 5500, Infinity);
        this._manager.on('shardCreate', (shard: S) => {
            if (logger.isEnableHook()) {
                logger.sendDiscord(`Shard Create [${shard.id}]`, 'Shard created', 'info', devMode);
            }
            shard
                .on('spawn', () => {
                    if (logger.isEnableHook()) {
                        logger.sendDiscord(`Shard Spawn [${shard.id}]`, 'Shard spawned', 'info', devMode);
                    } else {
                        logger.info(`Shard Spawn [${shard.id}]`);
                    }
                })
                .on('error', (e: Error) => {
                    if (logger.isEnableHook()) {
                        logger.sendDiscord(
                            `Shard Error [${shard.id}]`,
                            `Shard Error with ${e !== undefined && e.message !== undefined ? e.message : e}`,
                            'error',
                            devMode,
                        );
                    } else {
                        console.log(e);
                        logger.error(
                            `Shard Error [${shard.id}]\n${e !== undefined && e.message !== undefined ? e.message : e}`,
                        );
                    }
                })
                .on('death', () => {
                    if (logger.isEnableHook()) {
                        logger.sendDiscord(`Shard Death [${shard.id}]`, 'Shard died', 'warning', devMode);
                    } else {
                        logger.warning(`Shard Death [${shard.id}]`);
                    }
                });
        });
    }

    get manager(): ShardingManager {
        return this._manager;
    }
}
