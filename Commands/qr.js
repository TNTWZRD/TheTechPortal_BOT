const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const Discord = require('discord.js')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'qr',
    aliases: ['code'],
    description: 'Generate a qr code',
    help: '!qr <"Code Data">: Generate a QR Code',
    usage: `<"Code Data">`,
    args: true,
    guildOnly: true,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.FUN,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            const query = querystring.stringify( {
                key:"EVxSAcDKTO503YBzQa7wL1Js4quZFdoG",
                text:args.join(' '),
                size:10,
            });

            const url = `https://www.qrcoder.co.uk/api/v3/?${query}`;

            const embed = new Discord.MessageEmbed()
                .setColor('#EFFF00')
                .setTitle("New QR Code")
                .setImage(url)
                .setFooter("QR Provided By: www.qrcoder.co.uk")

            msg.channel.send(embed);

            resolve("!Qr Executed, No Errors");
        });
	},
};