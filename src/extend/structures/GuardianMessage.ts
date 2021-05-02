import { Message as DMessage } from 'discord.js';

export const extendsMessage = (Message: typeof DMessage): typeof DMessage => {
    class GuardianMessage extends Message {}

    return GuardianMessage;
};
