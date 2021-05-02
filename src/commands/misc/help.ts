import { GuardianBot, GuardianMessageInterface } from 'botInterface';
import GuardianCommand from '../../extend/structures/GuardianCommand';
import { MessageEmbed, PermissionString } from 'discord.js';
import { GenericResponse } from '../../utils/GenericResponse';

export default class Help extends GuardianCommand {
    run = async (msg: GuardianMessageInterface, args: string[]): Promise<void> => {
        if (args === undefined || args.length === 0) {
            await this.showAllCMD(msg);
        } else {
            await this.getCmd(msg, args.join(' ').trim());
        }
    };

    constructor(client: GuardianBot, category: string) {
        super(client, {
            name: 'help',
            aliases: ['h'],
            usage: ['help', 'help <category>', 'help <cmd>'], // show help auto if array return multiple usage
            shortDesc: 'show help',
            activate: true, // show in help later same for short help
            cat: category, // auto define by dir
            permissions: { bot: ['EMBED_LINKS'] }, // require embed permissions for send message
        });
    }

    _cmdParserByCat = (cat: string, isDev: boolean): string => {
        let preRender = this.client.commands
            .filter((cmd) => cmd.config.cat === cat)
            .filter((cmd) => cmd.config.activate);
        if (!isDev) {
            preRender = preRender.filter((cmd) => cmd.config.ownerOnly === false);
        }
        return preRender.map((cmd) => `\`${cmd.config.name}\``).join(' | ');
    };

    /**
     * Show all cmd of current bot only if enable and can be show
     */
    private showAllCMD = async (msg: GuardianMessageInterface): Promise<void> => {
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(await msg.getTrad('GET_COMMANDS'))
            .setTimestamp();
        const cmdListParsed: string = this.client.commands
            .map((cat) => {
                return this._cmdParserByCat(cat.config.cat, msg.author.isDev);
            })
            .join('\n');
        embed.setDescription(cmdListParsed);
        await msg.channel.send(embed).catch(async (e) => {
            await msg.channel.error(
                await msg.getTrad('GENERIC_ERROR_CONTENT'),
                await msg.getTrad('GENERIC_ERROR_TITLE'),
            );

            if (this.client.debugMode) {
                this.client.logger.error(`Unable to Send message : ${e.message}\n${e.stack}`);
            }
        });
    };

    /**
     * Show all cmd by list
     */
    private getCmd = async (msg: GuardianMessageInterface, command: string): Promise<void> => {
        const cmd = this.client.commands.find(
            (c) => c.config.name === command.toLowerCase() || c.config.aliases.includes(command.toLowerCase()),
        );

        if (!cmd) {
            //check if is a category
            const cat = this.client.categories.find((cat) => cat === command.toLowerCase());
            if (!cat) {
                await msg.channel.error(
                    await msg.getTrad('UNKNOWN_CMD_CAT', {
                        content: `${command}`,
                        prefix: msg.guild.getPrefix(),
                    }),
                );
                return;
            }
            return await this.getCmdCat(msg, cat);
        }
        const msgTrad = async (key: number): Promise<string> => {
            return await msg.getTrad('HELP_HEADINGS', { position: key });
        };

        /**
         * Return to view the perms to human readable
         */
        const permsToString = async (perms: PermissionString[]): Promise<string[]> => {
            return Promise.all(
                perms.map((perm) => {
                    return msg.getTrad('PERMISSIONS', { perm: perm });
                }),
            );
        };

        //show the help for the current cmd
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(await msg.getTrad('GET_CMD', { cmd: cmd.config.name }));
        if (this.config.longDesc !== undefined && this.config.longDesc.length > 0) {
            embed.addField(
                await msgTrad(3), // here the must is call help description because can't manage the description in one lang
                await msg.getTrad(this.config.longDesc),
            );
        }
        embed
            .addField(
                await msgTrad(0),
                `\`\`\`${
                    this.config.usage !== undefined && Array.isArray(this.config.usage) && this.config.usage.length > 0
                        ? this.config.usage
                              .map((item) => {
                                  return `${
                                      msg.guild !== undefined && msg.guild !== null ? msg.guild.getPrefix() : 'g!'
                                  }${item}`;
                              })
                              .join('\n')
                        : // part if not defined or null or empty
                          await msg.getTrad('MISSING_USAGE')
                }
                    \`\`\``,
            )
            .addField(
                await msgTrad(1),
                this.config.examples !== undefined && this.config.examples.length > 0
                    ? this.config.examples.replace(
                          /[$_]/g,
                          msg.guild !== undefined && msg.guild !== null ? msg.guild.getPrefix() : 'g!',
                      )
                    : await msg.getTrad('MISSING_EXAMPLE'),
            )
            .addField(
                await msgTrad(2),
                `${this.config.cat.charAt(0).toLocaleUpperCase()}${this.config.cat.substr(1, this.config.cat.length)}`,
            )
            .addField(
                await msgTrad(4),
                this.config.aliases.length > 0
                    ? this.config.aliases.map((a) => `\`${a}\``).join('\n')
                    : await msg.getTrad('CMD_NO_ALIASES'),
            )
            .addField(
                await msgTrad(5),
                this.config.ownerOnly !== undefined && this.config.ownerOnly
                    ? await msg.getTrad('CMD_OWNER_ONLY')
                    : this.config.permissions !== undefined &&
                      this.config.permissions.user !== undefined &&
                      Array.isArray(this.config.permissions.user) &&
                      this.config.permissions.user.length > 0
                    ? `\`\`\`${(await permsToString(this.config.permissions.user)).join('\n')}\`\`\``
                    : 'EVERYONE',
            )
            .addField(
                await msgTrad(6),
                this.config.ownerOnly !== undefined && this.config.ownerOnly
                    ? await msg.getTrad('CMD_OWNER_ONLY')
                    : this.config.permissions !== undefined &&
                      this.config.permissions.bot !== undefined &&
                      Array.isArray(this.config.permissions.user) &&
                      this.config.permissions.bot.length > 0
                    ? `\`\`\`${(await permsToString(this.config.permissions.bot)).sort().join('\n')}\`\`\``
                    : 'EVERYONE',
            )
            .setFooter(await msg.getTrad('CMD_FOOTER'));
        await msg.channel.send(embed).catch((e) => GenericResponse(msg, this.client, e));
    };

    /**
     * Return to view all information of this category with all cmd contains this cat
     */
    private getCmdCat = async (msg: GuardianMessageInterface, cat: string): Promise<void> => {
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(
                await msg.getTrad('GET_CATEGORIE', {
                    cat: `${cat.charAt(0).toLocaleUpperCase()}${cat.substr(1, cat.length)}`,
                }),
            )
            .setTimestamp();
        const cmdListParsed: string = this._cmdParserByCat(cat, msg.author.isDev);
        //get description of categorie
        // show the description of this cmd
        embed.setDescription(
            `\`\`\`${await msg.getTrad('GET_CATEGORIE_DESCRIPTION', { cat: cat })}\`\`\`\n${cmdListParsed}`,
        );
        await msg.channel.send(embed).catch((e) => GenericResponse(msg, this.client, e));
    };
}
