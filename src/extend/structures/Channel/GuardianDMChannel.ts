import { DMChannel as DDMChannel, MessageEmbed } from 'discord.js';
import { GuardianBot, GuardianDMChannelInterface, GuardianMessageInterface } from 'botInterface';
import { GenericResponse } from '../../../utils/GenericResponse';

export const extendsDMChannel = (DMChannel: typeof DDMChannel): typeof DDMChannel => {
    class GuardianDMChannel extends DMChannel implements GuardianDMChannelInterface {
        constructor(client: GuardianBot, data: Record<string, unknown>) {
            super(client, data);
        }

        /**
         * Send error to view
         */
        public error(msg: GuardianMessageInterface, text: string, title?: string): void {
            const embed = new MessageEmbed().setColor('RED').setTimestamp();
            if (title !== undefined && title.length > 0) {
                embed.setTitle(title);
            }
            //for prevent error
            if (text !== undefined && text.length > 0) {
                embed.setDescription(text);
            } else {
                //return null and no error
                return;
            }
            this.send(embed).catch((e) => GenericResponse(msg, this.client as GuardianBot, e));
            return;
        }
    }

    return GuardianDMChannel;
};
