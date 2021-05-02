import ConfigInterface from 'configInterface';
import {
    Client,
    ClientOptions,
    Collection,
    DMChannel,
    NewsChannel,
    PermissionString,
    Role,
    TextChannel,
    User,
} from 'discord.js';
import { LoggerInterface } from 'loggerInterface';
import GuardianDBInterface from 'guardianDBInterface';
import { Message as DiscordMessage, Guild as DiscordGuild } from 'discord.js';
import LangManager from '../extend/structures/Lang/LangManager';
import { UGuard } from 'extendType';

export interface GuardianBot extends Client {
    db: GuardianDBInterface;
    debugMode: boolean;
    config: ConfigInterface;
    commands: Collection<string, GuardianCommandInterface>;
    categories: string[];
    langManager: LangManager;
    logger: LoggerInterface;
    start: () => void;
}

export interface IObjectKeys {
    [key: string]: string | number | undefined;
}

export interface GuardianCommandInterface {
    canRun: (user: User, msg: GuardianMessageInterface) => Promise<boolean>;
    client: GuardianBot;
    config: GuardianCommandOptions;
    run: (msg: GuardianMessageInterface, args: string[]) => Promise<void>;
}

export interface GuardianEvent {
    // eslint-disable-next-line
    run: (args?: any[]) => void;
}

export interface GuardianOptions extends ClientOptions {
    logger: LoggerInterface;
    config: ConfigInterface;
    cmdPath: string;
    langPath: string;
    eventPath: string;
    debug?: boolean;
}

export interface UserInterface {
    _id?: string;
    afk?: string;
    defaultLang: boolean;
    lang: string;
    registerAt: Date;
    reminds: [];
    rep: number;
    userID: string;
}

export interface GuildInterface {
    _id?: string;
    guildID: string;
    prefix?: string;
    lang: string;
    mods: {
        welcome: {
            enable: boolean;
            message?: string;
            channel?: string;
            image?: string;
        };
        goodbye: {
            enable: boolean;
            message?: string;
            channel?: string;
            image?: string;
        };
        autoRole: {
            enable: boolean;
            roles?: Array<string>;
        };
        tickets: {
            enable: boolean;
            category?: string;
        };
        logs: {
            warn: {
                enable: boolean;
                channel?: string;
            };
            ban: {
                enable: boolean;
                channel?: string;
            };
            mute: {
                enable: boolean;
                channel?: string;
            };
        };
    };
}

export interface GuardianCommandOptions {
    /**
     * If cmd is enable or no
     */
    activate: boolean;
    /**
     * Aliase of cmd
     */
    aliases: string[];
    /**
     * Define the category
     */
    cat: string;
    /**
     * Cooldown of cmd default is 5s (5000ms)
     */
    cooldown?: number;
    dmOnly?: boolean;
    examples?: string;
    guildOnly?: boolean;
    /**
     * Hidden cmd like eval and other stuff
     */
    hidden?: boolean;
    /**
     * Long description
     */
    longDesc?: string;
    /**
     * Name of cmd
     */
    name: string;
    /**
     * if can run only in nsfw channel
     */
    nsfw?: boolean;
    /**
     * If only dev can run
     */
    ownerOnly?: boolean;
    permissions?: {
        user?: PermissionString[];
        bot?: PermissionString[];
    };
    /**
     * Short description
     */
    shortDesc: string;
    /**
     * If you want register cmd to slash cmd
     */
    slash?: boolean;
    /**
     * usage of this cmd
     */
    usage?: Array<string>;
}

export interface GuardianDMChannelInterface extends DMChannel {
    error: (text: string, title?: string) => void;
}

export interface GuardianNewsChannelInterface extends NewsChannel {
    error: (text: string, title?: string) => void;
}

export interface GuardianTextChannelInterface extends TextChannel {
    error: (text: string, title?: string) => void;
}

export interface GuardianGuildInterface extends DiscordGuild {
    convertMs: (ms: number) => Promise<string>;
    convertMsToDayHours: (seconds: number) => Promise<string>;
    getCurrentLang: () => string;
    getGuildData: () => GuildInterface | undefined;
    getPrefix: () => string;
    getTrad: (value: string, ...args: IObjectKeys[]) => Promise<string>;
    resolveRole: (search: string) => Promise<Role | null>;
}

export interface GuardianMessageInterface extends DiscordMessage {
    author: UGuard;
    guild: GuardianGuildInterface;
    channel: GuardianDMChannelInterface | GuardianNewsChannelInterface | GuardianTextChannelInterface;
}
