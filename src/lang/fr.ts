import LangInterface from 'LangInterface';
import { IObjectKeys } from 'botInterface';

interface langObjectInterface {
    [key: string]: string | undefined | ((...args: IObjectKeys[]) => string);
}

interface permissionInterface {
    [key: string]: string | undefined;
}

export default class FR implements LangInterface {
    private readonly lang: langObjectInterface;
    private format: { shortLang: string; lang: string; shortFormat: string };
    private readonly _perms: permissionInterface;
    private readonly _cat: permissionInterface;
    private readonly _heading: string[];

    constructor() {
        this._perms = {
            ADD_REACTIONS: 'Ajouter des réactions',
            ADMINISTRATOR: 'Administrateur',
            BAN_MEMBERS: 'Bannir un membre',
            CONNECT: 'Se connecter au canal vocal',
            CREATE_INSTANT_INVITE: 'Créer une invitation',
            EMBED_LINKS: 'Envoyer un embed',
            KICK_MEMBERS: 'Expulser un member',
            MANAGE_CHANNELS: 'Gérer les channels',
            MANAGE_GUILD: 'Gérer le serveur',
            MANAGE_MESSAGES: 'Gérer les messages',
            MANAGE_ROLES: 'Gérer les rôles',
            PRIORITY_SPEAKER: 'Orateur prioritaire',
            SEND_MESSAGES: 'Envoyer des messages',
            SPEAK: 'Parler dans le channel vocal',
            STREAM: 'Stream',
            VIEW_CHANNEL: 'Voir le channel',
            VIEW_AUDIT_LOG: `Afficher le journal d'audit`,
        };
        this._cat = {
            misc: 'Toutes les commandes diverses pour vous aider à gérer votre serveur',
        };
        this._heading = [
            '● Usage :',
            '● Exemples :',
            '● Groupe :',
            '● Description :',
            '● Alias :',
            '● Permissions Utilisateur :',
            '● Permissions Bot :',
            '● Liens :',
        ];
        this.lang = {
            CMD_FOOTER: `Syntaxe: [] = obligatoire, <> = facultatif`,
            CMD_NO_ALIASES: `Aucun alias`,
            CMD_OWNER_ONLY: `Owner seulement`,
            ERR_DM_ONLY: `Cette commande ne peut être exécutée que dans les messages privés`,
            ERR_GUILD_NSFW_ONLY: `Cette commande ne peut être exécutée que dans un channel NSFW`,
            ERR_GUILD_ONLY: `Cette commande ne peut être exécutée que sur un serveur`,
            COOLDOWN_CMD: (t) => `Veuillez réessayer dans ${this.convertMs(Number(t.time))}`,
            GENERIC_ERROR_CONTENT: `Une erreur inconnu est survenu`,
            GENERIC_ERROR_TITLE: `Une erreur s'est produite`,
            GET_CATEGORIE: (c) => `Catégorie ${c.cat}`,
            GET_CATEGORIE_DESCRIPTION: (c) => {
                return this._cat[c.cat as string] !== undefined && (this._cat[c.cat as string] as string).length > 0
                    ? (this._cat[c.cat as string] as string)
                    : '';
            },
            GET_CMD: (c) => `Aide ${c.cmd}`,
            GET_COMMANDS: 'Commandes',
            HELP_HEADINGS: (c) => this._heading[Number(c.position)],
            MISSING_EXAMPLE: `Pas d'exemple`,
            MISSING_PERMISSIONS: (item) => `Des permissions sont manquantes :\`\`\`${item.p}\`\`\``,
            MISSING_USAGE: `Usage non défini`,
            PERMISSIONS: (p) => this._perms[p.perm as string] as string,
            PREFIX_DM: (info) => `Le préfixe est \`${info.prefix}\``,
            PREFIX_INFO: (info) => `Le préfixe de ce serveur est \`${info.prefix}\``,
            UNKNOWN_CMD_CAT: (c) =>
                `Je ne connais pas, la commande ou la catégorie \`${c.content}\` n'existe pas. Utilise \`${c.prefix}help\` pour avoir la liste complète des commandes.`,
        };
        this.format = {
            lang: 'français',
            shortLang: 'fr',
            shortFormat: 'fr-FR',
        };
    }

    /**
     * Get traduction of terme with all param
     */
    get(term: string, ...args: IObjectKeys[]): string {
        const value = this.lang[term];
        switch (typeof value) {
            case 'function':
                return value(...args);
            default:
                return value !== undefined && value.length > 0 ? value : '';
        }
    }

    convertMs = (ms: number): string => {
        const roundTowardsZero = ms > 0 ? Math.floor : Math.ceil;
        const days = roundTowardsZero(ms / 86400000),
            hours = roundTowardsZero(ms / 3600000) % 24,
            minutes = roundTowardsZero(ms / 60000) % 60;
        let seconds = roundTowardsZero(ms / 1000) % 60;
        if (seconds === 0) {
            seconds++;
        }
        const isDays = days > 0,
            isHours = hours > 0,
            isMinutes = minutes > 0;
        const pattern =
            (!isDays ? '' : isMinutes || isHours ? '{days} jours, ' : '{days} jours et ') +
            (!isHours ? '' : isMinutes ? '{hours} heures, ' : '{hours} heures et ') +
            (!isMinutes ? '' : '{minutes} minutes et ') +
            '{seconds} secondes';
        return pattern
            .replace('{duration}', pattern)
            .replace('{days}', String(days))
            .replace('{hours}', String(hours))
            .replace('{minutes}', String(minutes))
            .replace('{seconds}', String(seconds));
    };

    /**
     * Convert second to human date
     * Example 1 day 15 hours 25 minutes 15 seconds
     */
    convertMsToDayHours = (seconds: number): string => {
        seconds = Number(seconds);
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const dDisplay = d > 0 ? d + (d == 1 ? ' jour, ' : ' jours, ') : '';
        const hDisplay = h > 0 ? h + (h == 1 ? ' heure, ' : ' heures, ') : '';
        const mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
        const sDisplay = s > 0 ? s + (s == 1 ? ' seconde' : ' secondes') : '';
        return dDisplay + hDisplay + mDisplay + sDisplay;
    };
}
