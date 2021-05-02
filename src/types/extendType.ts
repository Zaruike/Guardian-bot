import { IObjectKeys, UserInterface } from 'botInterface';
import { User } from 'discord.js';

export interface UGuard extends User {
    isDefaultLocal: () => Promise<boolean>;
    isDev: boolean;
    userData: Promise<UserInterface | undefined>;
    convertMs: (ms: number) => Promise<string>;
    convertMsToDayHours: (seconds: number) => Promise<string>;
    getCurrentLang: () => Promise<string>;
    getTrad: (value: string, ...args: IObjectKeys[]) => Promise<string>;
}
