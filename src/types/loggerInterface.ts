export default interface consoleInterface extends Console {
    draft: (info: string | undefined) => string;
}

export interface LoggerInterface {
    color: (color: string, text: string) => string;
    cmds: (info: unknown, returnString?: boolean) => string | void;
    draft: (name: string | number, text: string) => Promise<string | void>;
    endDraft: (name: string | number, text: string, succeed?: boolean) => Promise<void>;
    error: (name: string | number | Error, returnString?: boolean) => string | void;
    loading: (info: unknown, returnString?: boolean) => string | void;
    info: (info: unknown, returnString?: boolean) => string | void;
    updateDraft: (name: string | number, text: string) => Promise<string | void>;
    warning: (info: unknown, returnString?: boolean) => string | void;
    isEnableHook: () => boolean;
    sendDiscord: (title: string, message: string, type: string, devMod: boolean) => void;
}
