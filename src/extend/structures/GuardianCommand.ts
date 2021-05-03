import { GuardianBot, GuardianCommandInterface, GuardianCommandOptions, GuardianMessageInterface } from 'botInterface';
import { Collection, PermissionString, Snowflake, User } from 'discord.js';

export default abstract class GuardianCommand implements GuardianCommandInterface {
    public _config: GuardianCommandOptions;
    private readonly _client: GuardianBot;
    // define a collection of cmd and with snowflake determine the user. e.g...
    private readonly _Cooldown: Collection<string, Collection<Snowflake, number>> = new Collection();

    private readonly defaultPermission: {
        user: PermissionString[];
        bot: PermissionString[];
    };

    protected constructor(client: GuardianBot, option: GuardianCommandOptions) {
        this.defaultPermission = {
            user: ['VIEW_CHANNEL'],
            bot: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        };
        this._client = client;
        this._Cooldown = new Collection();
        this._config = {
            slash: option.slash || false, //auto register slash cmd if true soon feature
            guildOnly: option.guildOnly || false,
            ownerOnly: option.ownerOnly || false,
            dmOnly: option.dmOnly || false,
            hidden: option.hidden || false,
            nsfw: option.nsfw || false,
            cooldown: option.cooldown || 5000,
            aliases: option.aliases || [],
            shortDesc: option.shortDesc,
            usage: option.usage || [],
            name: option.name,
            longDesc: option.longDesc,
            examples: option.examples || '',
            activate: option.activate,
            permissions:
                option.permissions !== undefined && typeof option.permissions === 'object'
                    ? typeof option.permissions.bot !== 'undefined' &&
                      Array.isArray(option.permissions.bot) &&
                      typeof option.permissions.user !== 'undefined' &&
                      Array.isArray(option.permissions.user)
                        ? {
                              user: [...option.permissions.user, ...this.defaultPermission.user],
                              bot: [...option.permissions.bot, ...this.defaultPermission.bot],
                          }
                        : typeof option.permissions.bot !== 'undefined' && Array.isArray(option.permissions.bot)
                        ? {
                              user: this.defaultPermission.user,
                              bot: [...option.permissions.bot, ...this.defaultPermission.bot],
                          }
                        : typeof option.permissions.user !== 'undefined' && Array.isArray(option.permissions.user)
                        ? {
                              user: [...option.permissions.user, ...this.defaultPermission.user],
                              bot: this.defaultPermission.bot,
                          }
                        : this.defaultPermission
                    : this.defaultPermission,
            //basic permissions of discord
            cat: option.cat,
        };
        //define to cmd to collection
        if (!this._Cooldown.has(this._config.name)) this._Cooldown.set(this._config.name, new Collection());
    }

    get config(): GuardianCommandOptions {
        return this._config;
    }

    get client(): GuardianBot {
        return this._client;
    }

    /**
     * Determine here if user can Run this cmd or not
     */
    public canRun = async (user: User, msg: GuardianMessageInterface): Promise<boolean> => {
        const now = Date.now();
        const timestamps = this._Cooldown.get(this._config.name) as Collection<Snowflake, number>;
        if (!timestamps.has(msg.author.id)) {
            timestamps.set(msg.author.id, now);
            // ignore cooldown for dev
            if (msg.author.isDev) timestamps.delete(msg.author.id);
            //check permissions

            return await this.havePermissionBot(msg);
        } else {
            //here user exist check if time is ok or not cooldown  can't null and timestamp is already defined before
            const expireTime = (timestamps.get(msg.author.id) as number) + (this._config.cooldown as number);
            if (now < expireTime) {
                await msg.channel.send(
                    msg.guild !== undefined && !(await msg.author.isDefaultLocal())
                        ? await msg.guild.getTrad('COOLDOWN_CMD', { time: expireTime - now })
                        : await msg.author.getTrad('COOLDOWN_CMD', { time: expireTime - now }),
                );
                return false;
            }
            timestamps.set(msg.author.id, now);
            setTimeout(() => timestamps.delete(msg.author.id), this._config.cooldown as number);
            //check permissions
            return await this.havePermissionBot(msg);
        }
    };

    public abstract run(msg: GuardianMessageInterface, args: string[]): Promise<void>;

    private async havePermissionBot(msg: GuardianMessageInterface): Promise<boolean> {
        //if dm return true else check permissions
        if (msg.channel.type === 'dm') return true;
        let hasPermission = true;
        const missingPerm: PermissionString[] = [];
        const isDefaultLocal = msg.guild !== undefined && !(await msg.author.isDefaultLocal());
        if (msg.guild.me !== null) {
            if (this._config.permissions !== undefined && this._config.permissions.bot !== undefined) {
                for (const perm of this._config.permissions.bot) {
                    //check if bot have permissions to send msg e.g...
                    if (!msg.guild.me.permissions.has(perm)) {
                        hasPermission = false;
                        missingPerm.push(perm);
                    }
                }
                //if bot don't have permissions
                if (!hasPermission && missingPerm.length > 0) {
                    //return to message to view if can send message else return just into console
                    const permToHuman = missingPerm.map(async (p) =>
                        isDefaultLocal
                            ? await msg.guild.getTrad('PERMISSIONS', { perm: p })
                            : await msg.author.getTrad('PERMISSIONS', { perm: p }),
                    );
                    const permToHumanString = await permToHuman.join(', ');
                    if (missingPerm.includes('SEND_MESSAGES')) {
                        // can't send into channel resend to console here
                        this.client.logger.error(
                            `[PERMISSIONS] Missing permissions for send message in guild ${this.client.logger.color(
                                'red',
                                msg.channel.guild.name,
                            )}and ${this.client.logger.color(
                                'red',
                                permToHumanString.substr(0, permToHumanString.length - 2),
                            )}`,
                        );
                        return hasPermission;
                    } else {
                        //send simple string if can't send a embed
                        if (missingPerm.includes('EMBED_LINKS')) {
                            await msg.channel.error(
                                msg,
                                isDefaultLocal
                                    ? await msg.guild.getTrad('MISSING_PERMISSIONS', { p: permToHumanString })
                                    : await msg.author.getTrad('MISSING_PERMISSIONS', { p: permToHumanString }),
                                isDefaultLocal
                                    ? await msg.guild.getTrad('GENERIC_ERROR_TITLE')
                                    : await msg.author.getTrad('GENERIC_ERROR_TITLE'),
                            );
                        } else {
                            //here can send embed
                            await msg.channel
                                .send(
                                    isDefaultLocal
                                        ? await msg.guild.getTrad('MISSING_PERMISSIONS', { p: permToHumanString })
                                        : await msg.author.getTrad('MISSING_PERMISSIONS', { p: permToHumanString }),
                                )
                                .catch((e) => {
                                    if (this.client.debugMode) {
                                        this.client.logger.error(
                                            `Unable to send Message to guild : ${e.message}\n${e.stack}`,
                                        );
                                    }
                                });
                        }
                        return hasPermission;
                    }
                }
            } else {
                // here don't need permissions
                hasPermission = true;
            }
        } else {
            hasPermission = false;
        }

        return hasPermission;
    }
}
