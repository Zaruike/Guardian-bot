import { existsSync, readFileSync } from 'fs';

interface IObjectKeys {
    [key: string]: string | undefined;
}

const NEWLINES_MATCH = /\n|\r|\r\n/;
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
const RE_NEWLINES = /\\n/g;
const NEWLINE = '\n';

class EnvLoader {
    private readonly path: string;

    constructor(path: string = __dirname + '/.env') {
        this.path = path;
    }

    loadFile = async (): Promise<void> => {
        if (existsSync(this.path)) {
            const envFileContent = readFileSync(this.path);
            const envConfig = envFileContent.toString().split(NEWLINES_MATCH);
            const obj: IObjectKeys = {};
            for (let i = 0; i < envConfig.length; i++) {
                const keyValueArr = envConfig[i].match(RE_INI_KEY_VAL);
                if (keyValueArr != null) {
                    const key = keyValueArr[1];
                    let val = keyValueArr[2] || '';
                    const end = val.length - 1;
                    const isDoubleQuoted = val[0] === '"' && val[end] === '"';
                    const isSingleQuoted = val[0] === "'" && val[end] === "'";
                    if (isSingleQuoted || isDoubleQuoted) {
                        val = val.substring(1, end);
                        // if double quoted, expand newlines
                        if (isDoubleQuoted) {
                            val = val.replace(RE_NEWLINES, NEWLINE);
                        }
                    } else {
                        // remove surrounding whitespace
                        val = val.trim();
                    }
                    obj[key] = val;
                }
            }
            for (const k in obj) {
                process.env[k] = obj[k];
            }
        } else {
            throw new Error(`Environment config file not found: ${this.path}`);
        }
    };
}

export default EnvLoader;
