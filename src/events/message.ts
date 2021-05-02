import { GuardianBot, GuardianCommandInterface, GuardianEvent, GuardianMessageInterface } from 'botInterface';
import { DMChannel } from 'discord.js';
import { GenericResponse } from '../utils/GenericResponse';

/**
 * Message Event
 */
export default class Message implements GuardianEvent {
    private guardian: GuardianBot;

    constructor(guardian: GuardianBot) {
        this.guardian = guardian;
    }

    // eslint-disable-next-line
    public run = async (args: any): Promise<void> => {
        const msg: GuardianMessageInterface = args;
        //ignore other bot
        if (msg.author.bot) return;

        // for get the information about current prefix only if ping the bot
        if (msg.content.match(new RegExp(`^<@!?${this.guardian.user?.id}>( |)$`))) {
            if (msg.guild) {
                await msg.channel
                    .send(
                        !(await msg.author.isDefaultLocal())
                            ? await msg.author.getTrad('PREFIX_INFO', { prefix: msg.guild.getPrefix() })
                            : await msg.guild.getTrad('PREFIX_INFO', { prefix: msg.guild.getPrefix() }),
                    )
                    .catch((e) => {
                        if (this.guardian.debugMode) {
                            this.guardian.logger.error(`Unable to Send message : ${e.message}\n${e.stack}`);
                        }
                    });
            } else {
                await msg.channel.send(await msg.author.getTrad('PREFIX_DM', { prefix: 'g!' })).catch((e) => {
                    if (this.guardian.debugMode) {
                        this.guardian.logger.error(`Unable to Send message : ${e.message}\n${e.stack}`);
                    }
                });
            }
            return; // return empty because Promise<void>
        }
        //get prefix in guild or dm
        const prefix = !msg.guild ? 'g!' : msg.guild.getPrefix();
        // ignore other message if isn't start by prefix
        if (!msg.content.startsWith(prefix)) return;
        // get args content for made cmd get the first for cmd other param is param of this cmd
        const argsContent = msg.content.slice(prefix.length).trim().split(/\s+/g);
        // minus the command

        const cmdSearchPre = argsContent.shift();
        // compare the typeof and not !cmdSearchPre because can return number type
        if (typeof cmdSearchPre === 'undefined') return;
        const searchCmd = cmdSearchPre.toLowerCase();
        let cmd: GuardianCommandInterface | undefined;
        /**
         * search with aliases or name
         * you can search with "has" if you want because commands contain a collection of names. But the best way to find the command is to search for the aliases at the same time
         */
        if (!this.guardian.commands.find((c) => c.config.name === searchCmd || c.config.aliases.includes(searchCmd))) {
            // in futur check the custom cmd
            return;
        } else {
            cmd = this.guardian.commands.find(
                (c) => c.config.name === searchCmd || c.config.aliases.includes(searchCmd),
            );
        }
        if (cmd == undefined) return;
        // if CMD is disable
        if (!cmd.config.activate) return;
        // if cmd is run in DM and can run only in guild
        if (cmd.config.guildOnly && !msg.guild) {
            await msg.channel.send(await msg.author.getTrad('ERR_GUILD_ONLY')).catch((e) => {
                if (this.guardian.debugMode) {
                    this.guardian.logger.error(`Unable to Send message in DM : ${e.message}\n${e.stack}`);
                }
            });
            return;
        }

        // if cmd is run in guild but is require only in DM
        if (cmd.config.dmOnly && msg.channel.type !== 'dm') {
            await msg.channel
                .send(
                    !(await msg.author.isDefaultLocal())
                        ? await msg.author.getTrad('ERR_DM_ONLY')
                        : await msg.guild.getTrad('ERR_DM_ONLY'),
                )
                .catch((e) => {
                    if (this.guardian.debugMode) {
                        this.guardian.logger.error(`Unable to Send message in Guild : ${e.message}\n${e.stack}`);
                    }
                });
            return;
        }

        /**
         * if cmd is run in guild without nsfw channel
         * type nsfw doesn't exist in DMChannel (is normal :D )
         * cmd nsfw can't run in DM don't forget that
         */
        if (cmd.config.nsfw && !(msg.channel instanceof DMChannel) && msg.channel.nsfw) {
            await msg.channel.send(await msg.guild.getTrad('ERR_GUILD_NSFW_ONLY')).catch((e) => {
                if (this.guardian.debugMode) {
                    this.guardian.logger.error(`Unable to Send message in Guild : ${e.message}\n${e.stack}`);
                }
            });
            return;
        }

        /**
         * Check if this command is for owner only and if the user is dev to run this cmd else return message to user
         */
        if (cmd.config.ownerOnly && !msg.author.isDev) {
            if (!msg.guild) {
                await msg.channel.send(await msg.author.getTrad('ERR_USER_NOT_DEV')).catch((e) => {
                    if (this.guardian.debugMode) {
                        this.guardian.logger.error(`Unable to Send message in DM : ${e.message}\n${e.stack}`);
                    }
                });
            } else {
                await msg.channel
                    .send(
                        !(await msg.author.isDefaultLocal())
                            ? await msg.author.getTrad('ERR_DM_ONLY')
                            : await msg.guild.getTrad('ERR_USER_NOT_DEV'),
                    )
                    .catch((e) => {
                        if (this.guardian.debugMode) {
                            this.guardian.logger.error(`Unable to Send message in Guild : ${e.message}\n${e.stack}`);
                        }
                    });
            }
            return;
        }

        //Check permissions and cooldown return error to view
        if (!(await cmd.canRun(msg.author, msg))) return;

        await cmd.run(msg, argsContent).catch(async (e) => {
            if (this.guardian.debugMode) {
                this.guardian.logger.error(
                    `[${
                        cmd !== undefined ? cmd.config.name : 'Unknown cmd'
                    }] An error was encountered while executing the command\n${this.guardian.logger.error(
                        e.message,
                    )}\n${e.stack}}`,
                );
            }
            //return error
            await GenericResponse(
                msg.channel,
                msg.guild !== undefined && !(await msg.author.isDefaultLocal()),
                msg.author,
                msg.guild,
                this.guardian,
                e,
                msg.channel.type,
                false,
            );
        });
    };
}
