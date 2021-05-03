import { TextChannel as DTextChannel, MessageEmbed } from 'discord.js';
import {
    GuardianBot,
    GuardianGuildInterface,
    GuardianMessageInterface,
    GuardianTextChannelInterface,
} from 'botInterface';

export const extendsTextChannel = (TextChannel: typeof DTextChannel): typeof DTextChannel => {
    class GuardianTextChannel extends TextChannel implements GuardianTextChannelInterface {
        constructor(guild: GuardianGuildInterface, data: Record<string, unknown>) {
            super(guild, data);
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
            this.send(embed).catch((e) => {
                const cl = this.client as GuardianBot;
                if (cl.debugMode) {
                    cl.logger.error(`Unable to send message to DM with reason : ${e.message}\n${e.stack}`);
                }
            });
            return;
        }
    }

    return GuardianTextChannel;
};
