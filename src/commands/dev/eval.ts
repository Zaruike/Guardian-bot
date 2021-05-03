import GuardianCommand from '../../extend/structures/GuardianCommand';
import { GuardianBot, GuardianMessageInterface } from 'botInterface';
import { EvalCallToParse, random, toStringObjName } from '../../utils/EvalHelper';
import Discord, { MessageEmbed } from 'discord.js';
import * as util from 'util';
import * as os from 'os';
import { GenericResponse } from '../../utils/GenericResponse';
// is better using performance instead Date
import { performance } from 'perf_hooks';

export default class Eval extends GuardianCommand {
    run = async (msg: GuardianMessageInterface, args: string[]): Promise<void> => {
        let res, stack;
        let o!: Error;
        let error = false;
        const start = performance.now();
        try {
            res = await EvalCallToParse.call(this, args.join(' ').trim(), { msg, os, Discord });
        } catch (e) {
            res = e;
            error = true;
        }

        if (typeof res !== 'string') {
            if (typeof res === 'undefined') {
                res = await msg.getTrad('RETURN_EMPTY');
            } else {
                const jParse = res instanceof Object ? this._toStringFormat(res) : null;
                if (jParse && jParse !== res.toString()) {
                    if (res instanceof Error) {
                        error = true;
                        o = res;
                    }
                    res = jParse;
                } else if (typeof res === 'object') res = util.inspect(res, { depth: 2, showHidden: true });
                else if (res instanceof Promise) res = await res;
                else if (res instanceof Function) res = res.toString();
                else if (res instanceof Buffer) res = res.toString();
                else res = res.toString();
            }
        }

        // if contains token removed and replaced with other
        if (res.indexOf(process.env.token) !== -1) {
            res = res.replace(new RegExp(process.env.token as string, 'g'), random(25));
        }

        if (error) {
            const st: string[] =
                o !== undefined && o !== null ? (o.stack !== undefined ? o.stack.split('\n') : res) : res;
            let i = 0;
            if (!stack) stack = '';
            for (const line of st) if (res.length + 50 + stack.length < 950) (stack += `\n${line}`), ++i;
            if (st.length !== i) stack += `\n(...) and ${st.length - i} more lines`;
        }
        const end = performance.now();
        const embed = new MessageEmbed()
            .setTitle(await msg.getTrad('EVALUATED_TIME', { time: (end - start).toFixed(3) }))
            .setColor(error ? 'DARK_RED' : 'RANDOM')
            .setTimestamp()
            .addField(await msg.getTrad('EVALUATED_INPUT'), `\`\`\`js\n${args.join(' ').trim()}\`\`\``)
            .addField(
                await msg.getTrad('EVALUATED_OUTPUT'),
                `\`\`\`js\n${res.length > 980 ? res.substr(0, 980) : res}\`\`\`${
                    error ? `\n**Stack**\`\`\`js\n${stack}')\`\`\`` : ''
                }`,
            );
        await msg.channel.send(embed).catch((e) => GenericResponse(msg, this.client, e));
        return;
    };

    constructor(client: GuardianBot, category: string) {
        super(client, {
            name: 'eval',
            aliases: [],
            usage: ['eval [eval content]'],
            activate: true,
            cat: category,
            ownerOnly: true,
            hidden: true,
            shortDesc: 'eval content',
            permissions: { bot: ['EMBED_LINKS'] },
        });
    }

    _format = (objectItem: Record<string, unknown>, props: string[]): string => {
        const str = [];
        for (const p of props) {
            if (objectItem[p] instanceof Object) {
                let found = false;
                for (const obj of toStringObjName.values) {
                    if (obj.test(objectItem[p])) {
                        found = true;
                        str.push([p, this._format(objectItem[p] as Record<string, unknown>, obj.props)]);
                    }
                }
                if (!found) str.push([p, (objectItem[p] as string).toString()]);
            } else str.push([p, objectItem[p]]);
        }
        return `<${objectItem.constructor.name}${str.reduce(
            (a, b) =>
                typeof b[1] === 'string' && ['<'].some((j) => !(b[1] as string).startsWith(j))
                    ? `${a} ${b[0]}="${b[1]}"`
                    : `${a} ${b[0]}=${b[1]}`,
            '',
        )}>`;
    };

    /**
     * Transform to xml object
     */
    _toStringFormat(d: Record<string, unknown>): string {
        for (const o of toStringObjName.values) {
            if (o.test(d)) return this._format(d, o.props);
        }
        return d.toString();
    }
}
