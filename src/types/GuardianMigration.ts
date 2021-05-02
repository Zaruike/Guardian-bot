export interface GuardianMigration {
    version: () => number;
    start: () => Promise<void>;
}
