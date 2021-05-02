import { GuardianBot, GuardianGuildInterface, GuildInterface, IObjectKeys } from 'botInterface';
import { Guild as DGuild, Role } from 'discord.js';
import GuildEntry from './DB/GuildEntry';

export const extendsGuild = (Guild: typeof DGuild): typeof DGuild => {
    class GuardianGuild extends Guild implements GuardianGuildInterface {
        // private _logChannel!: string;
        private _guildData!: GuildInterface | undefined;

        constructor(client: GuardianBot, data: Record<string, unknown>) {
            super(client, data);
            //init Guild entry with this ID
            new GuildEntry(this.id, client.db, client.debugMode, client.logger).getData().then((data) => {
                this._guildData = data;
            });
        }

        public getGuildData = (): GuildInterface | undefined => {
            return this._guildData;
        };

        /**
         * Load file provide default or current lang of this guild
         */
        public getTrad = async (value: string, ...args: IObjectKeys[]): Promise<string> => {
            const cl = this.client as GuardianBot;
            const lang = await cl.langManager.getLang(this.getCurrentLang());
            if (lang !== undefined) {
                const r = await lang.get(value, ...args);
                if (r !== undefined && r.length > 0) {
                    //return translate value
                    return r;
                } else {
                    //return value if is missing
                    return value;
                }
            } else {
                //return value if is missing
                return value;
            }
        };

        public convertMs = async (ms: number): Promise<string> => {
            //copy client because Typing isn't available...
            const cl = this.client as GuardianBot;
            //get lang
            const lang = await cl.langManager.getLang(this.getCurrentLang());
            //if undefined return default value
            if (lang !== undefined) {
                const r = await lang.convertMs(ms);
                if (r !== undefined && r.length > 0) {
                    //return time to human read
                    return r;
                } else {
                    //if undefined return default value
                    return String(ms);
                }
            } else {
                //if undefined return default value
                return String(ms);
            }
        };

        public convertMsToDayHours = async (seconds: number): Promise<string> => {
            //copy client because Typing isn't available...
            const cl = this.client as GuardianBot;
            //get lang
            const lang = await cl.langManager.getLang(this.getCurrentLang());
            //if undefined return default value
            if (lang !== undefined) {
                const r = await lang.convertMsToDayHours(seconds);
                if (r !== undefined && r.length > 0) {
                    //return time to human read
                    return r;
                } else {
                    //if undefined return default value
                    return String(seconds);
                }
            } else {
                //if undefined return default value
                return String(seconds);
            }
        };

        /**
         * Return current or default prefix of bot cmd in guild
         */
        public getPrefix(): string {
            return this.getGuildData() !== undefined // can return undefined define the default prefix
                ? this.getGuildData()?.prefix !== undefined &&
                  typeof this.getGuildData()?.prefix === 'string' &&
                  (this.getGuildData()?.prefix?.length as number) > 0
                    ? <string>this.getGuildData()?.prefix // cas undefined check and verify
                    : 'g!'
                : 'g!';
        }

        public getCurrentLang(): string {
            return this.getGuildData() !== undefined
                ? this.getGuildData()?.lang !== undefined &&
                  typeof this.getGuildData()?.lang === 'string' &&
                  (this.getGuildData()?.lang.length as number) > 0
                    ? <string>this.getGuildData()?.lang // cas undefined check and verify
                    : 'en'
                : 'en';
        }

        /**
         * Search role by name ToLowerCase is enable in default
         */
        async resolveRole(search: string): Promise<Role | null> {
            let role = null;
            if (!search) return null;
            // check if search role is a ID or a single string
            const searchMatch = search.match(/^<@&!?(\d+)>$/);
            if (searchMatch) {
                //return id of role
                role = this.roles.cache.get(searchMatch[1]);
                if (role) return role;
            }
            //get by name
            return this.roles.cache.find((role) => role.name.toLowerCase() === search.toLowerCase()) as Role;
        }
    }

    return GuardianGuild;
};
