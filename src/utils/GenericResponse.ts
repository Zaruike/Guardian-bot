import { GuardianBot, GuardianMessageInterface } from 'botInterface';

/**
 * Show the default error to view
 */
export const GenericResponse = async (
    msg: GuardianMessageInterface,
    client: GuardianBot,
    e: Error,
    showError = false,
): Promise<void> => {
    await msg.channel.error(await msg.getTrad('GENERIC_ERROR_CONTENT'), await msg.getTrad('GENERIC_ERROR_TITLE'));
    // if error return to channel the error

    if (client.debugMode && showError) {
        client.logger.error(`[${msg.channel.type}] Unable to Send message : ${e.message}\n${e.stack}`);
    }
};
