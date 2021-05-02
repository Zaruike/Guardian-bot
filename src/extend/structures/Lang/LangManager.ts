import { LoggerInterface } from 'loggerInterface';
import { join } from 'path';
import LangInterface from 'LangInterface';
import LangManagerInterface from 'LangManagerInterface';

interface LangInterfaceObject {
    [key: string]: LangInterface | undefined;
}

export default class LangManager implements LangManagerInterface {
    private readonly _lang: LangInterfaceObject;
    private readonly _logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this._lang = ([] as unknown) as LangInterfaceObject; // no choice to make that ...
        this._logger = logger;
    }

    /**
     * Register one lang to the manager
     * @param {string} lang - Name of current lang
     * @param {string} pathLang - Path of current lang want load
     */
    registerLang = async (lang: string, pathLang: string): Promise<boolean> => {
        try {
            const { default: Lang } = await import(join(pathLang, `${lang}.js`));
            this._lang[lang] = new Lang(); // lang
            return true;
        } catch (e) {
            this._logger.error(`Unable to register ${lang}`);
            return false;
        }
    };

    /**
     * Get lang manager by lang
     * @param {string} lang
     */
    getLang(lang: string): LangInterface | undefined {
        if ({}.hasOwnProperty.call(this._lang, lang)) {
            return this._lang[lang];
        } else {
            return undefined;
        }
    }
}
