import { Collection, Db, MongoClient } from 'mongodb';
import GuardianDBInterface from 'guardianDBInterface';
import { LoggerInterface } from 'loggerInterface';
import { readdirSync } from 'fs';
import { join } from 'path';
import * as os from 'os';

class GuardianDB implements GuardianDBInterface {
    private readonly uri: string;
    private cachedClient!: MongoClient;
    private cachedDB!: Db;
    private readonly nameMigrationDB: string;
    private readonly migrationsVersion: null | number;

    constructor(migrationsVersion = null) {
        this.migrationsVersion = migrationsVersion;
        this.uri = process.env.MONGODB_URI as string;
        this.nameMigrationDB = 'GuardianMigrations';
    }

    _formatOS(os: string): string {
        switch (os) {
            case 'win32':
                return 'Windows';
            case 'linux':
                return 'Linux';
            case 'darwin':
            default:
                return 'MacOs';
        }
    }

    /**
     * Connect the user to DB
     */
    connectToDB = async (): Promise<{ client: MongoClient; db: Db }> => {
        const client = await MongoClient.connect(this.uri, {});
        const db = await client.db(process.env.DB_NAME);
        this.cachedClient = client;
        this.cachedDB = db;
        return { client, db };
    };

    /**
     * Get collection by name and return to view
     */
    async getCollection(collectionName: string): Promise<Collection> {
        const { client } = await this.connectToDB();
        const db = await client.db(process.env.DB_NAME);
        return db.collection(collectionName);
    }

    /**
     * Retrieve the current version of the last migration present on the server
     */
    async getVersion(): Promise<number> {
        const col = await this.getCollection(this.nameMigrationDB);
        return new Promise((resolve) => {
            col.find().toArray((err, result) => {
                if (err) {
                    return resolve(0);
                }
                if (result !== undefined && result.length > 0) {
                    return resolve(result[result.length - 1].version);
                } else {
                    //insert a default version
                    col.insertOne({
                        version: 0,
                    });
                    return resolve(0);
                }
            });
        });
    }

    /**
     * Get last version number available provide file
     */
    fileVersion(): { file: Array<string>; v: number | string } {
        const file = readdirSync(join(__dirname, '../../migration'));
        if (file.length > 0) {
            //getting the latest file means it's the latest version
            const v = file[file.length - 1];
            return { file: file, v: v.split('.')[0] };
        } else {
            return { file: [], v: 0 };
        }
    }

    async migrations(migrationsVersion: null | number | string, logger: LoggerInterface): Promise<void> {
        const version = await this.getVersion();
        const { v, file } = this.fileVersion();
        logger.info(
            [
                logger.color('blue', `Core init:`),
                logger.color('blue', 'Overview:'),
                '',
                `NODE Version:          ${logger.color('yellow', process.version)}`,
                `OS:                    ${logger.color('yellow', this._formatOS(os.platform()))}`,
                `OS Version:            ${logger.color('yellow', os.release())}`,
                '',
            ].join('\n'),
        );
        if (migrationsVersion != null) {
            //restrict only one version
            if (version > migrationsVersion) {
                logger.warning('INVALID VERSION\nMigration cancel');
                return;
            } else {
                for (let i = version; i < migrationsVersion; i++) {
                    if (file[i] != null) {
                        // restriction on the version only those being below the requested version
                        if (file[i].split('.')[0] < migrationsVersion) {
                            const { default: fileContent } = await import(
                                join(__dirname, `../../migration/${file[i]}`)
                            );
                            // import auto file
                            const ct = new fileContent(logger, this, this.nameMigrationDB);
                            await ct.start();
                        }
                    }
                }
            }
        } else {
            // auto deployment no version specified is based on those of the database
            if (v > version) {
                for (let i = version; i < v; i++) {
                    if (file[i] != null) {
                        // restriction on the version only those being below the requested version
                        const { default: fileContent } = await import(join(__dirname, `../../migration/${file[i]}`));
                        // import auto file
                        const ct = new fileContent(logger, this, this.nameMigrationDB);
                        await ct.start();
                    }
                }
            }
        }
    }

    /**
     * Init script and migrations in next
     * @return {Promise<void>}
     */
    init = async (logger: LoggerInterface, debugMode: boolean): Promise<void> => {
        try {
            await this.connectToDB();
            await logger.endDraft('checkControl', `[Check] Db pass`);
            //check local version of DB is undefined or lower start migration
            await this.migrations(this.migrationsVersion, logger);
        } catch (e) {
            await logger.endDraft('checkControl', `[Check] Unable to load DB. Check if your env DB is correct.`, false);
            if (debugMode) {
                logger.error(`[Check] Error Code ${e.message}\n${e.stack}`);
            }
        }
    };
}

export default new GuardianDB();
