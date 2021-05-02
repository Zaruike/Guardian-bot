import { WebhookClient } from 'discord.js';

export class Webhook {
    private _webhook: WebhookClient;
    protected defaultOption: {
        username: string;
        content?: string;
        avatar_url?: string;
        color?: string | number;
        embeds?: { title: string; description: string }[];
    };

    constructor(id: string, secret: string) {
        this._webhook = new WebhookClient(id, secret);
        this.defaultOption = {
            username:
                process.env.username !== undefined && process.env.username.length > 0
                    ? process.env.username
                    : 'Guardian Hook',
            avatar_url: `https://cdn.discordapp.com/avatars/835876040265170974/5272b9cc30a61b90e286b154a02ef42e.png?size=2048`,
            color: 15258703,
        };
    }

    send = (
        content = '',
        message: string,
        title: string,
        color?: string | number,
        avatar?: string,
        username?: string,
    ): void => {
        const options = this.defaultOption;
        if (content.length > 0) {
            options.content = content;
        }

        if (avatar !== undefined && avatar.length > 0) {
            options.avatar_url = avatar;
        }

        if (username !== undefined && username.length > 0) {
            options.username = username;
        }

        if (color !== undefined) {
            options.color = color;
        }
        options.embeds = [
            {
                title: title,
                description: message,
            },
        ];

        this._webhook.send(options).catch(() => null);
    };
}
