import { GuardianBot, GuardianOptions } from 'botInterface';
import { readdirSync } from 'fs';
import { LoggerInterface } from 'loggerInterface';
import { join } from 'path';
import { Collection, Client as DiscordClient } from 'discord.js';
import ConfigInterface from 'configInterface';
import GuardianCommand from './GuardianCommand';
import GuardianDBInterface from 'guardianDBInterface';
// Extend default structure of d.js here
import '../ExtendedCore';
import GuardianDB from './GuardianDB';
import LangManager from './Lang/LangManager';
//implements GuardianBot
export default class GuardianClient extends DiscordClient implements GuardianBot {
    private readonly _langManager: LangManager;

    public get langManager(): LangManager {
        return this._langManager;
    }

    public get logger(): LoggerInterface {
        return this._logger;
    }

    public get debugMode(): boolean {
        return this._debug;
    }

    public get config(): ConfigInterface {
        return this._config;
    }

    public get commands(): Collection<string, GuardianCommand> {
        return this._commands;
    }

    public get categories(): string[] {
        return this._categories;
    }

    public get db(): GuardianDBInterface {
        return this._db;
    }

    private readonly _commands: Collection<string, GuardianCommand> = new Collection<string, GuardianCommand>();
    private readonly _categories: string[] = [];
    private readonly _debug: boolean;
    private readonly _db: GuardianDBInterface;
    private readonly _config: ConfigInterface;
    private readonly _cmdPath: string;
    private readonly _eventPath: string;
    private readonly _langPath: string;
    private readonly _logger: LoggerInterface;

    constructor(options: GuardianOptions) {
        super(options);
        this._logger = options.logger;
        this._config = options.config;
        this._debug = options.debug !== undefined ? options.debug : false;
        this._cmdPath = options.cmdPath;
        this._langPath = options.langPath;
        this._eventPath = options.eventPath;
        // init DB authentication and enable the check db connection e.g...
        this._db = GuardianDB;
        this._langManager = new LangManager(this._logger);
        this.start();
    }

    /**
     * Start the bot with cmd e.g...
     * @return {void}
     */
    public start = (): void => {
        this.logger.draft('checkControl', '[CHECK] Vérification des prérequis');
        this._db.init(this._logger, this._debug);
        this._loadLangs();
        this._loadEvents();
        this._loadCommands();
        // start the bot :D
    };

    /**
     * Load all lang for consume load ram after
     * @return {void}
     */
    private _loadLangs = (): void => {
        const pathLangs = join(__dirname, '../../', this._langPath);
        let loadedLangs = 0;
        let langs: string[] = [];
        const langsFiles = readdirSync(pathLangs);
        if (langsFiles !== undefined && langsFiles.length > 0) {
            //ignore js.map because no need here
            langs = langsFiles.filter((e) => !e.includes('.js.map'));
        }
        this._logger.draft('fileLangs', `Loaded ${loadedLangs}/${langs.length} langs`);
        langs.forEach(async (e) => {
            try {
                loadedLangs++;
                if (!(await this.langManager.registerLang(e.split('.')[0], pathLangs))) {
                    this._logger.error(`[LANG] failed to register ${e.split('.')[0]}`);
                }
                if (langs.length === loadedLangs) {
                    await this._logger.endDraft(
                        'fileLangs',
                        `Loaded ${loadedLangs}/${langs.length} lang${langs.length > 1 ? 's' : ''}`,
                        true,
                    );
                } else {
                    await this._logger.updateDraft(
                        'fileLangs',
                        `Loaded ${loadedLangs}/${langs.length} lang${langs.length > 1 ? 's' : ''}`,
                    );
                }
            } catch (e) {
                this._logger.error(`[LANG] failed to register ${e.split('.')[0]}\n${e.message}`);
                if (this.debugMode) {
                    this._logger.error(`[LANG] ${e.stack}`);
                }
            }
        });
    };

    /**
     * Load all event provide dir
     * @return {void}
     */
    private _loadEvents = (): void => {
        const pathEvent = join(__dirname, '../../', this._eventPath);
        let loadedEvents = 0;
        let events: string[] = [];
        const eventsFiles = readdirSync(pathEvent);
        if (eventsFiles !== undefined && eventsFiles.length > 0) {
            //ignore js.map file
            events = eventsFiles.filter((e) => !e.includes('.js.map'));
        }
        this._logger.draft('fileEvents', `Loaded ${loadedEvents}/${events.length} events`);
        events.forEach(async (e) => {
            try {
                const { default: eventFileLoad } = await import(join(pathEvent, e));
                //get file with direct class
                // init class
                const event = new eventFileLoad(this);
                loadedEvents++;
                //get event name with file
                this.on(e.split('.')[0], (...args: string[]) => event.run(...args));
                if (events.length === loadedEvents) {
                    await this._logger.endDraft('fileEvents', `Loaded ${loadedEvents}/${events.length} events`, true);
                } else {
                    await this._logger.updateDraft('fileEvents', `Loaded ${loadedEvents}/${events.length} events`);
                }
            } catch (err) {
                this._logger.error(`[EVENT] Failed to load event ${e}: ${err.stack || err}`);
            }
        });
    };
    /**
     * Load all cmd provide path given before
     * @return {Promise<void>}
     */
    private _loadCommands = async (): Promise<void> => {
        const path = join(__dirname, '../../', this._cmdPath);
        const pathCmds = readdirSync(path);
        for (const dir of pathCmds) {
            const commands = await readdirSync(join(path, dir));
            if (commands !== null && commands.length > 0) {
                const items = commands.filter((e) => !e.includes('.js.map') && e.includes('.js'));
                for (const cmd of items) {
                    try {
                        const { default: cmdFileLoad } = await import(join(path, dir, cmd));
                        const command: GuardianCommand = new cmdFileLoad(this, dir);
                        if (command.config.activate) {
                            if (!this._categories.includes(dir)) {
                                this._categories.push(dir);
                            }
                            this._commands.set(command.config.name, command);
                            this._logger.warning(`[${dir}][${cmd.split('.')[0]}] Loaded command`);
                        }
                    } catch (e) {
                        this._logger.error(`[${dir}][${cmd.split('.')[0]}] fail to load command\n${e.stack}`);
                    }
                }
            }
        }
    };
}
