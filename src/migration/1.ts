import { LoggerInterface } from 'loggerInterface';
import { GuardianMigration } from 'GuardianMigration';
import GuardianDBInterface from 'guardianDBInterface';

export default class M001 implements GuardianMigration {
    private readonly migrationName: string;
    private readonly _version: number;
    private _db: GuardianDBInterface;
    private description: string[];
    private _logger: LoggerInterface;

    constructor(logger: LoggerInterface, db: GuardianDBInterface, migrationName: string) {
        this._logger = logger;
        this.migrationName = migrationName;
        this._version = 1;
        this._db = db;
        this.description = [`Testing migration mode`];
    }

    version(): number {
        return this._version;
    }

    async start(): Promise<void> {
        this._logger.info(
            [
                `${this._logger.color('green', 'Deployment of the version ' + this._version)}`,
                ``,
                `${this._logger.color('blue', 'Description :')}`,
                ``,
                `${this._logger.color('yellow', this.description.join('\n'))}`,
                ``,
            ].join('\n'),
        );
        const colUpdateVersion = await this._db.getCollection(this.migrationName);
        await colUpdateVersion.updateOne({ version: 0 }, { $set: { version: 1 } });
    }
}
