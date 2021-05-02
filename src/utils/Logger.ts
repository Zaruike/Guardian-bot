import consoleInterface from 'loggerInterface';
import { sleep } from './sleep';
import { Webhook } from './Webhook';

interface IObjectKeys {
    [key: string]: string | undefined;
}

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const consoleF: consoleInterface = (console as unknown) as consoleInterface;
require('draftlog').into(console);

class Logger {
    private drafts: Map<
        string | number,
        { spinning: boolean | number; text: string; draft: (value: string | void) => string }
    >;
    private _devMod: boolean;

    private readonly _colors: IObjectKeys = {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
    };

    private readonly _webhook?: Webhook;
    private readonly _enableHook: boolean;

    constructor(devMod = false, enableHook = false, hookID = '', hookSecret = '') {
        this._devMod = devMod;
        this._enableHook = enableHook;
        //if not webhook provide disable auto the hook
        if (!hookID || hookID.length === 0 || !hookSecret || hookSecret.length === 0) {
            this._enableHook = false;
        } else {
            this._webhook = new Webhook(hookID, hookSecret);
        }
        this.drafts = new Map();
    }

    public isEnableHook = (): boolean => {
        return this._enableHook;
    };

    /**
     * update the map only value for change text
     */
    private _updateMap = async (name: string, value: string) => {
        if (this.drafts.has(name)) {
            const k = this.drafts.get(name);
            if (k !== undefined) {
                k.text = value;
                k.spinning = true;
                await sleep(50);
                const clone = new Map(this.drafts).set(name, k);
                await sleep(50);
                this.drafts = clone;
            }
        }
        return this.drafts;
    };

    public color(color: string, text: string): string {
        if (this._colors.hasOwnProperty(color)) {
            return `${this._colors[color]}${text}\x1b[0m`;
        } else {
            return `${text}\x1b[0m`;
        }
    }

    loading = (load: unknown, returnString?: boolean): string | void => {
        const log = `[${this.color('magenta', Date().toString().split(' ').slice(1, 5).join(' '))}] ${load}`;
        if (returnString) {
            return log;
        }
        console.log(log);
    };

    cmds = (cmd: unknown, returnString?: boolean): string | void => {
        const log = `[${this.color('cyan', Date().toString().split(' ').slice(1, 5).join(' '))}] ${cmd}`;
        if (returnString) {
            return log;
        }
        console.log(log);
    };

    error = (err: unknown, returnString?: boolean): string | void => {
        const log = `[${this.color('red', Date().toString().split(' ').slice(1, 5).join(' '))}] ${err}`;
        if (returnString) {
            return log;
        }
        console.log(log);
    };

    warning = (warning: unknown, returnString?: boolean): string | void => {
        const log = `[${this.color('yellow', Date().toString().split(' ').slice(1, 5).join(' '))}] ${warning}`;
        if (returnString) {
            return log;
        }
        console.log(log);
    };

    info = (info: unknown, returnString?: boolean): string | undefined => {
        const log = `[${this.color('green', Date().toString().split(' ').slice(1, 5).join(' '))}] ${info}`;
        if (returnString) {
            return log;
        }
        console.log(log);
    };

    draft = async (name: string | number, text: string): Promise<string | void> => {
        if (!process.stderr.isTTY) {
            return this.info(text);
        }
        this.drafts.set(name, {
            spinning: true,
            text,
            draft: (consoleF.draft(this.info(`${frames[0]} ${this.drafts.get(name)?.text}`, true)) as unknown) as (
                value: string | void,
            ) => string,
        });
        if (this.drafts.get(name) !== undefined && this.drafts.get(name) !== null) {
            for (let i = 0; Number(this?.drafts?.get(name)?.spinning); i++) {
                await sleep(50);
                this?.drafts
                    ?.get(name)
                    ?.draft(this.info(`${frames[i % frames.length]} ${this.drafts.get(name)?.text}`, true));
            }
        }
    };

    /**
     * Update only text value
     */
    updateDraft = async (name: string | number, text: string): Promise<string | void> => {
        // return just info without tty
        if (!process.stderr.isTTY) {
            return this.info(text);
        }
        await this._updateMap(String(name), text);
    };

    endDraft = async (
        name: string | number,
        text: string,
        succeed = true,
        nameTitle = `[GUARDIAN] `,
    ): Promise<void> => {
        if (this.drafts !== null && this.drafts.get(name) !== null && this.drafts.get(name)?.spinning !== undefined) {
            const dr = (this.drafts.get(name) as unknown) as { spinning: boolean };
            dr.spinning = false;
        }
        await sleep(50);
        this?.drafts
            ?.get(name)
            ?.draft(
                this[succeed ? 'info' : 'error'](
                    `${succeed ? '✔' : '✖'} ${nameTitle !== null ? nameTitle : ''}${text}`,
                    true,
                ),
            );
        this.drafts.delete(name);
    };

    sendDiscord = async (title: string, description: string, type: string, devMod = false): Promise<void> => {
        //check if webhook is enable
        if (this._enableHook && this._webhook !== undefined) {
            await this._webhook.send('', title, description);
        } else {
            //hook are disable
            this.warning('Webhook are disable');
        }

        //show in console if enable
        if (devMod) {
            switch (type) {
                case 'error':
                    this.error(`[${title}] ${description}`);
                    break;
                case 'warning':
                    this.error(`[${title}] ${description}`);
                    break;
                case 'debug':
                    this.cmds(`[${title}] ${description}`);
                    break;
                case 'info':
                default:
                    this.info(`[${title}] ${description}`);
                    break;
            }
        }
    };
}

export default Logger;
