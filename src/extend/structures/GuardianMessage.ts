import { DMChannel, Message as DMessage, NewsChannel, TextChannel } from 'discord.js';
import { GuardianBot, GuardianGuildInterface, GuardianMessagePreInterface, IObjectKeys } from 'botInterface';
import { UGuard } from 'extendType';

export const extendsMessage = (Message: typeof DMessage): typeof DMessage => {
    class GuardianMessage extends Message implements GuardianMessagePreInterface {
        constructor(
            client: GuardianBot,
            data: Record<string, unknown>,
            channel: TextChannel | DMChannel | NewsChannel,
        ) {
            super(client, data, channel);
        }

        public getTrad = async (value: string, ...args: IObjectKeys[]): Promise<string> => {
            return this.guild !== null && !(await (this.author as UGuard).isDefaultLocal())
                ? await (this.guild as GuardianGuildInterface).getTrad(value, ...args)
                : await (this.author as UGuard).getTrad(value, ...args);
        };
    }

    return GuardianMessage;
};
