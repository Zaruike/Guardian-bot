import LangInterface from 'LangInterface';
import { IObjectKeys } from 'botInterface';

interface langObjectInterface {
    [key: string]: string | undefined | ((...args: IObjectKeys[]) => string);
}

interface permissionInterface {
    [key: string]: string | undefined;
}

export default class EN implements LangInterface {
    private readonly lang: langObjectInterface;
    private format: { shortLang: string; lang: string; shortFormat: string };
    private readonly _perms: permissionInterface;
    private readonly _cat: permissionInterface;
    private readonly _heading: string[];

    constructor() {
        this._heading = [
            'Help :',
            '● Usage :',
            '● Examples :',
            '● Group :',
            '● Description :',
            '● Alias :',
            '● Member Permissions :',
            '● Bot Permissions :',
            '● Links :',
        ];
        this._perms = {
            ADD_REACTIONS: 'Add Reactions',
            ADMINISTRATOR: 'Administrator',
            BAN_MEMBERS: 'Ban Members',
            CONNECT: 'Connect To Voice Channel',
            CREATE_INSTANT_INVITE: 'Create Invite',
            EMBED_LINKS: 'Send Embed',
            KICK_MEMBERS: 'Kick Members',
            MANAGE_CHANNELS: 'Manage Channels',
            MANAGE_GUILD: 'Manage Guild',
            MANAGE_MESSAGES: 'Manage Messages',
            MANAGE_ROLES: 'Manage Roles',
            PRIORITY_SPEAKER: 'Priority Speaker',
            SEND_MESSAGES: 'Send Messages',
            SPEAK: 'Speak In Voice Channel',
            STREAM: 'Stream',
            VIEW_CHANNEL: 'View Channel',
            VIEW_AUDIT_LOG: 'View Audit Log',
        };
        this._cat = {
            dev: 'All commands related to bot development or programming',
            misc: 'All the miscellaneous commands to help you manage your server',
        };
        this.lang = {
            CMD_FOOTER: `Syntax: [] = required, <> = optional`,
            CMD_NO_ALIASES: `No aliases`,
            CMD_OWNER_ONLY: `Owner only`,
            COOLDOWN_CMD: (t) => `Please retry in ${this.convertMs(Number(t.time))}`,
            ERR_DM_ONLY: `This command can only be executed in private messages`,
            ERR_GUILD_NSFW_ONLY: `This command can only be executed in an NSFW channel`,
            ERR_GUILD_ONLY: `This command can only be executed in a server`,
            ERR_USER_NOT_DEV: `Only bot owners can run this command`,
            EVALUATED_INPUT: `:inbox_tray: Input`,
            EVALUATED_OUTPUT: `:outbox_tray: Output`,
            EVALUATED_TIME: (e) => `Evaluated in \`${e.time}\`ms`,
            GENERIC_ERROR_CONTENT: `An unknown error has occurred`,
            GENERIC_ERROR_TITLE: `An error occurred`,
            GET_CATEGORIE: (c) => `${c.cat} category`,
            GET_CATEGORIE_DESCRIPTION: (c) => {
                return this._cat[c.cat as string] !== undefined && (this._cat[c.cat as string] as string).length > 0
                    ? (this._cat[c.cat as string] as string)
                    : '';
            },
            GET_CMD: (c) => `Help ${c.cmd}`,
            GET_COMMANDS: 'Commands',
            HELP_HEADINGS: (c) => this._heading[Number(c.position)],
            MISSING_EXAMPLE: `Pas d'exemple`,
            MISSING_PERMISSIONS: (item) => `Missing permissions :\`\`\`${item.p}\`\`\``,
            MISSING_USAGE: `Usage non défini`,
            PERMISSIONS: (p) => this._perms[p.perm as string] as string,
            PREFIX_DM: (info) => `The prefix is \`${info.prefix}\``,
            PREFIX_INFO: (info) => `The prefix of this server is \`${info.prefix}\``,
            UNKNOWN_CMD_CAT: (c) =>
                `I do not know that, the command or category \`${c.content}\` does not exist. uses \`${c.prefix}help\` for a complete list of commands.`,
        };
        this.format = {
            lang: 'english',
            shortLang: 'en',
            shortFormat: 'en-US',
        };
    }

    /**
     * Get traduction of terme with all param
     */
    get(term: string, ...args: IObjectKeys[]): string {
        const value = this.lang[term];
        switch (typeof value) {
            case 'function':
                return value(...args);
            default:
                return value !== undefined && value.length > 0 ? value : '';
        }
    }

    convertMs = (ms: number): string => {
        const roundTowardsZero = ms > 0 ? Math.floor : Math.ceil;
        const days = roundTowardsZero(ms / 86400000),
            hours = roundTowardsZero(ms / 3600000) % 24,
            minutes = roundTowardsZero(ms / 60000) % 60;
        let seconds = roundTowardsZero(ms / 1000) % 60;
        if (seconds === 0) {
            seconds++;
        }
        const isDays = days > 0,
            isHours = hours > 0,
            isMinutes = minutes > 0;
        const pattern =
            (!isDays ? '' : isMinutes || isHours ? '{days} days, ' : '{days} days and ') +
            (!isHours ? '' : isMinutes ? '{hours} hours, ' : '{hours} hours and ') +
            (!isMinutes ? '' : '{minutes} minutes and ') +
            '{seconds} seconds';
        return pattern
            .replace('{duration}', pattern)
            .replace('{days}', String(days))
            .replace('{hours}', String(hours))
            .replace('{minutes}', String(minutes))
            .replace('{seconds}', String(seconds));
    };

    /**
     * Convert second to human date
     * Example 1 day 15 hours 25 minutes 15 seconds
     */
    convertMsToDayHours = (seconds: number): string => {
        seconds = Number(seconds);
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : '';
        const hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
        const mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
        const sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
        return dDisplay + hDisplay + mDisplay + sDisplay;
    };
}
