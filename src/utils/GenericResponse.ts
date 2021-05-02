import {
    GuardianBot,
    GuardianDMChannelInterface,
    GuardianGuildInterface,
    GuardianNewsChannelInterface,
    GuardianTextChannelInterface,
} from 'botInterface';
import { UGuard } from 'extendType';

/**
 * Show the default error to view
 */
export const GenericResponse = async (
    channel: GuardianDMChannelInterface | GuardianNewsChannelInterface | GuardianTextChannelInterface,
    isLocal: boolean,
    author: UGuard,
    guild: GuardianGuildInterface,
    client: GuardianBot,
    e: Error,
    type = 'Guild',
    showError = true, // for disable message if want overwrite with other message like message Event
): Promise<void> => {
    await channel.error(
        isLocal ? await guild.getTrad('GENERIC_ERROR_CONTENT') : await author.getTrad('GENERIC_ERROR_CONTENT'),
        isLocal ? await guild.getTrad('GENERIC_ERROR_TITLE') : await author.getTrad('GENERIC_ERROR_TITLE'),
    );
    // if error return to channel the error

    if (client.debugMode && showError) {
        client.logger.error(`[${type}] Unable to Send message : ${e.message}\n${e.stack}`);
    }
};
