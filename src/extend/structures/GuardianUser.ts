import { GuardianBot, IObjectKeys, UserInterface } from 'botInterface';
import { User as DUser } from 'discord.js';
import { UGuard } from 'extendType';
import UserEntry from './DB/UserEntry';

export const extendsUser = (User: typeof DUser): typeof DUser => {
    class GuardianUser extends User implements UGuard {
        readonly isDev: boolean;
        private readonly _userData: Promise<UserInterface | undefined>;

        constructor(client: GuardianBot, data: Record<string, unknown>) {
            super(client, data);
            this.isDev = client.config.devs.includes(this.id);
            //need promise for that no choices all methods decline that using promise
            this._userData = new UserEntry(this.id, client.db, client.debugMode, client.logger).getData();
        }

        get userData(): Promise<UserInterface | undefined> {
            return this._userData;
        }

        public async getCurrentLang(): Promise<string> {
            const userD = await this._userData;
            return userD !== undefined
                ? userD?.lang !== undefined && typeof userD?.lang === 'string' && (userD?.lang.length as number) > 0
                    ? <string>userD?.lang // cas undefined check and verify
                    : 'en'
                : 'en';
        }

        public async isDefaultLocal(): Promise<boolean> {
            const userD = await this._userData;
            return userD !== undefined ? userD.defaultLang : false;
        }

        public convertMs = async (ms: number): Promise<string> => {
            //copy client because Typing isn't available...
            const cl = this.client as GuardianBot;
            //get lang
            const lang = await cl.langManager.getLang(await this.getCurrentLang());
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
        /**
         * Load file provide default or current lang of this user
         */
        public getTrad = async (value: string, ...args: IObjectKeys[]): Promise<string> => {
            const cl = this.client as GuardianBot;
            const lang = await cl.langManager.getLang(await this.getCurrentLang());
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

        public convertMsToDayHours = async (seconds: number): Promise<string> => {
            //copy client because Typing isn't available...
            const cl = this.client as GuardianBot;
            //get lang
            const lang = await cl.langManager.getLang(await this.getCurrentLang());
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
    }

    return GuardianUser;
};
