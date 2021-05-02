import { Collection, Db, MongoClient } from 'mongodb';
import { LoggerInterface } from 'loggerInterface';

export default interface GuardianDBInterface {
    connectToDB: () => Promise<{ client: MongoClient; db: Db }>;
    init: (logger: LoggerInterface, debugMode: boolean) => Promise<void>;
    getCollection: (collectionName: string) => Promise<Collection>;
}
