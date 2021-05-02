import { IObjectKeys } from 'botInterface';

export default interface LangInterface {
    get: (term: string, ...args: IObjectKeys[]) => string | undefined;
    convertMs: (ms: number) => string;
    convertMsToDayHours: (seconds: number) => string;
}
