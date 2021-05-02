import GuardianDBInterface from 'guardianDBInterface';
import { Collection, ObjectId } from 'mongodb';
import { GuildInterface } from 'botInterface';
import { LoggerInterface } from 'loggerInterface';

export default class GuildEntry {
    private readonly _id: string;
    private readonly _db: GuardianDBInterface;
    private readonly defaultInsertionGuild: GuildInterface;
    private readonly debugMode: boolean;
    private readonly _logger: LoggerInterface;

    constructor(id: string, db: GuardianDBInterface, debugMode: boolean, logger: LoggerInterface) {
        this._id = id;
        // link of DB without collection if want in future to another DB
        this._db = db;
        this.debugMode = debugMode;
        this._logger = logger;
        this.defaultInsertionGuild = {
            guildID: '',
            prefix: 'g!',
            lang: 'en',
            mods: {
                welcome: {
                    enable: false,
                    message: undefined,
                    channel: undefined,
                    image: undefined,
                },
                goodbye: {
                    enable: false,
                    message: undefined,
                    channel: undefined,
                    image: undefined,
                },
                autoRole: {
                    enable: false,
                    roles: [],
                },
                tickets: {
                    enable: false,
                    category: undefined,
                },
                logs: {
                    warn: {
                        enable: false,
                        channel: undefined,
                    },
                    ban: {
                        enable: false,
                        channel: undefined,
                    },
                    mute: {
                        enable: false,
                        channel: undefined,
                    },
                },
            },
        };
    }

    /**
     * Check if guild exist and return boolean after
     * @return {Boolean}
     */
    _checkGuildExist = async (id: string): Promise<boolean> => {
        const colGuild: Collection = await this._db.getCollection('guild');
        const guildDBData = await colGuild.findOne({ guildID: id });
        return guildDBData !== undefined && guildDBData !== null;
    };

    /**
     * Get data of current guild provide DB
     */
    getData = async (): Promise<GuildInterface | undefined> => {
        //on start random moment can return empty
        if (this._id === undefined) return;
        if (await this._checkGuildExist(this._id)) {
            return await this.findByGuildID(this._id);
        } else {
            /**
             * if success return this (this a example)
             * { acknowledged: true, insertedId: new ObjectId("608c218a3db85a49cf444035") }
             */
            return await this.createGuildEntry(this._id);
        }
    };

    /**
     * Create new entry
     */
    createGuildEntry = async (guildID: string): Promise<GuildInterface | undefined> => {
        const colGuild: Collection = await this._db.getCollection('guild');
        const guildData = this.defaultInsertionGuild;
        guildData.guildID = guildID;
        const { acknowledged, insertedId } = await colGuild.insertOne(guildData);
        if (acknowledged) {
            //find guild by ID
            return await this.findByID(insertedId);
        } else {
            return undefined;
        }
    };

    /**
     * Get Guild by ObjectID
     */
    findByID = async (id: ObjectId): Promise<GuildInterface | undefined> => {
        const colGuild: Collection = await this._db.getCollection('guild');
        return colGuild
            .findOne({ _id: id })
            .then((result) => {
                if (result !== undefined) {
                    return result as GuildInterface;
                } else {
                    return undefined;
                }
            })
            .catch((err) => {
                if (err) {
                    if (this.debugMode) {
                        this._logger.error(`[GUILD findByID] ${err}\n${err.stack}`);
                    }
                    return undefined;
                }
            });
    };

    /**
     * Get guild by guild ID
     */
    findByGuildID = async (guildID: string): Promise<GuildInterface | undefined> => {
        const colGuild: Collection = await this._db.getCollection('guild');
        return colGuild
            .findOne({ guildID: guildID })
            .then((result) => {
                if (result !== undefined) {
                    return result as GuildInterface;
                } else {
                    return undefined;
                }
            })
            .catch((err) => {
                if (err) {
                    if (this.debugMode) {
                        this._logger.error(`[GUILD findByGuildID] ${err}\n${err.stack}`);
                    }
                    return undefined;
                }
            });
    };
}
