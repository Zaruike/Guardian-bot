import Discord from 'discord.js';
import { GuardianMessageInterface } from 'botInterface';
import os from 'os';

interface IObjectKeysEvalInterface {
    [key: string]: GuardianMessageInterface | typeof os | typeof Discord;
}

/**
 * Generate random string
 */
export const random = (len = 10, keySet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string => {
    let rand = '';
    for (let i = 0; i < len; i++) rand += keySet.charAt(Math.floor(Math.random() * keySet.length));
    return rand;
};

//declare self class
export const toStringObjName = new (class toStringObjNames {
    values: {
        test<T>(obj: T): boolean;
        props: string[];
    }[];

    constructor() {
        this.values = [];
        /**
         * define in default multiple class for more faster
         * you can add other class if you want
         */
        this.add((obj) => obj instanceof Discord.Client, ['readyAt'])
            .add((obj) => obj instanceof Discord.GuildChannel, ['id', 'name', 'type', 'createdAt'])
            .add((obj) => obj instanceof Discord.Guild, [
                'id',
                'name',
                'icon',
                'splash',
                'region',
                'ownerID',
                'memberCount',
                'large',
                'nsfw',
                'shardID',
            ])
            .add((obj) => obj instanceof Discord.Message, ['id', 'author', 'channel', 'content', 'tts', 'type'])
            // don't forget that or discord return embed.fields[1].value: Must be 1024 or fewer in length.
            .add((obj) => obj instanceof Error, ['name', 'message'])
            .add((obj) => obj instanceof Discord.User, [
                'id',
                'username',
                'discriminator',
                'avatar',
                'bot',
                'createdAt',
                'isDev',
            ]);
    }

    /**
     * Add class to return data
     * @param {<T>(obj: T) => boolean} test Type of class you want
     * @param {string[]} props you want extract
     */
    add = (test: <T>(obj: T) => boolean, props: string[]): toStringObjNames => {
        this.values.push({
            test,
            props,
        });
        return this;
    };
})();

export const EvalCallToParse = async (txt: string, v: IObjectKeysEvalInterface): Promise<typeof eval> => {
    for (const k in v) {
        new Function('value', k + ' = value ')(v[k]); // attempt to set the value
    }
    return eval(txt);
};
