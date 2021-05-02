import GuardianDBInterface from 'guardianDBInterface';
import { LoggerInterface } from 'loggerInterface';
import { Collection, ObjectId } from 'mongodb';
import { UserInterface } from 'botInterface';

export default class UserEntry {
    private readonly _id: string;
    private readonly _db: GuardianDBInterface;
    private readonly debugMode: boolean;
    private readonly _logger: LoggerInterface;
    private readonly _defaultInsertionUser: UserInterface;

    constructor(id: string, db: GuardianDBInterface, debugMode: boolean, logger: LoggerInterface) {
        this._id = id;
        this._db = db;
        this.debugMode = debugMode;
        this._logger = logger;
        this._defaultInsertionUser = {
            afk: undefined,
            lang: 'en',
            defaultLang: true,
            userID: '',
            registerAt: new Date(),
            reminds: [],
            rep: 0,
        };
    }

    /**
     * Check if user exist and return boolean after
     * @return {Boolean}
     */
    _checkUserExist = async (id: string): Promise<boolean> => {
        const colUser: Collection = await this._db.getCollection('user');
        const userDBData = await colUser.findOne({ userID: id });
        return userDBData !== undefined && userDBData !== null;
    };

    /**
     * Get data of current user or create new user in DB
     */
    getData = async (): Promise<UserInterface | undefined> => {
        if (this._id === undefined) return;
        if (await this._checkUserExist(this._id)) {
            return await this.findByUserID(this._id);
        } else {
            /**
             * if success return this (this a example)
             * { acknowledged: true, insertedId: new ObjectId("608c218a3db85a49cf444035") }
             */
            return await this.createUserEntry(this._id);
        }
    };

    /**
     * Get user by UserID
     */
    findByUserID = async (userID: string): Promise<UserInterface | undefined> => {
        const colUser: Collection = await this._db.getCollection('user');
        return colUser
            .findOne({ userID: userID })
            .then((result) => {
                if (result !== undefined) {
                    return result as UserInterface;
                } else {
                    return undefined;
                }
            })
            .catch((err) => {
                if (err) {
                    if (this.debugMode) {
                        this._logger.error(`[USER findByUserID] ${err}\n${err.stack}`);
                    }
                    return undefined;
                }
            });
    };

    findByID = async (id: ObjectId): Promise<UserInterface | undefined> => {
        const colUser: Collection = await this._db.getCollection('user');
        return colUser
            .findOne({ _id: id })
            .then((result) => {
                if (result !== undefined) {
                    return result as UserInterface;
                } else {
                    return undefined;
                }
            })
            .catch((err) => {
                if (err) {
                    if (this.debugMode) {
                        this._logger.error(`[USER findByID] ${err}\n${err.stack}`);
                    }
                    return undefined;
                }
            });
    };
    /**
     * Create new entry
     */
    createUserEntry = async (userID: string): Promise<UserInterface | undefined> => {
        const colUser: Collection = await this._db.getCollection('user');
        const userData = this._defaultInsertionUser;
        userData.userID = userID;
        const { acknowledged, insertedId } = await colUser.insertOne(userData);
        if (acknowledged) {
            //find user by ID
            return await this.findByID(insertedId);
        } else {
            return undefined;
        }
    };
}
