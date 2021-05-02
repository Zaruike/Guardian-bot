import { GuardianBot, GuardianEvent } from 'botInterface';

export default class Ready implements GuardianEvent {
    private guardian: GuardianBot;

    constructor(guardian: GuardianBot) {
        this.guardian = guardian;
    }

    public run = async (): Promise<void> => {
        // emit information when is ready
        if (this.guardian.user) {
            this.guardian.logger.info(`${this.guardian.user.username} is ready !`);
            // if game if define
            if (process.env.game !== undefined) {
                await this.guardian.user.setActivity({
                    name: process.env.game,
                    type: 'WATCHING',
                });
            }
        }
    };
}
