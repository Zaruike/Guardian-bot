import { DMChannel as DDMChannel, MessageEmbed } from 'discord.js';
import { GuardianBot, GuardianDMChannelInterface } from 'botInterface';

export const extendsDMChannel = (DMChannel: typeof DDMChannel): typeof DDMChannel => {
    class GuardianDMChannel extends DMChannel implements GuardianDMChannelInterface {
        constructor(client: GuardianBot, data: Record<string, unknown>) {
            super(client, data);
        }

        /**
         * Send error to view
         */
        public error(text: string, title?: string): void {
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
            this.send(embed).catch((e) => {
                const cl = this.client as GuardianBot;
                if (cl.debugMode) {
                    cl.logger.error(`Unable to send message to DM with reason : ${e.message}\n${e.stack}`);
                }
            });
            return;
        }
    }

    return GuardianDMChannel;
};
