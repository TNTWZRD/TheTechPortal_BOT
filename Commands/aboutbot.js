const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const Discord = require('discord.js')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'aboutbot',
    aliases: ['bot'],
    description: 'Get Information About This Bot!',
    help: `!about`,
    usage: ``,
    args: false,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.SYSTEM,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            embed = new Discord.MessageEmbed();

            embed.setTitle(`About ${msg.client.user.username}`);
            embed.setURL("https://github.com/TNTWZRD/TheTechPortal_BOT/blob/master/README.md");
            embed.setColor("#00ff00");
            embed.setDescription(await Utilities.getFile('README.min.md'));
            msg.channel.send(embed);

            resolve("!AboutBot Executed, No Errors");
        });
	},
};