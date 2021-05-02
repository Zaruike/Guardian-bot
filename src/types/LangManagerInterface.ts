import LangInterface from 'LangInterface';

export default interface LangManagerInterface {
    getLang: (lang: string) => LangInterface | undefined;
    registerLang: (lang: string, pathLang: string) => Promise<boolean>;
}
