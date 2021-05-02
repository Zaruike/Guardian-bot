import { Structures } from 'discord.js';
import { extendsMessage } from './structures/GuardianMessage';
import { extendsUser } from './structures/GuardianUser';
import { extendsGuild } from './structures/GuardianGuild';
import { extendsDMChannel } from './structures/Channel/GuardianDMChannel';
import { extendsTextChannel } from './structures/Channel/GuardianTextChannel';
import { extendsNewsChannel } from './structures/Channel/GuardianNewChannel';

Structures.extend('Guild', (Guild) => {
    return extendsGuild(Guild);
});
Structures.extend('User', (User) => {
    return extendsUser(User);
});
Structures.extend('Message', (Message) => {
    return extendsMessage(Message);
});

Structures.extend('DMChannel', (DMChannel) => {
    return extendsDMChannel(DMChannel);
});

Structures.extend('TextChannel', (TextChannel) => {
    return extendsTextChannel(TextChannel);
});

Structures.extend('NewsChannel', (NewsChannel) => {
    return extendsNewsChannel(NewsChannel);
});
