const Utilities = require('Utilities')
const Config = require(process.cwd() + '/config.json')
const Discord = require('discord.js')


module.exports = {
    name: 'ticket',
    aliases: [],
    description: 'Send a ticket request to server Admins.',
    help: '!ticket <DESCRIPTION>: Send a ticket request to server Admins.',
    usage: `<DESCRIPTION>`,
    args: true,
    guildOnly: true,
    module: Config.MODULES.SYSTEM,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            const TicketsChannel = msg.guild.channels.cache.find(ch => ch.name === 'tickets');
            if(!TicketsChannel) {
                msg.reply('Error, Please Try Again Later!');
                msg.guild.member(msg.guild.ownerID).createDM()
                    .then(dmChannel => { dmChannel.send(`There is no Ticket Channel Setup For ${msg.guild.name}, Please set one up as 'tickets', so that your users my submit tickets to your Admins.`); })
                return reject('No tickets Server Setup');
            }
            var embed = new Discord.MessageEmbed();
            embed.setTitle(`Ticket From: ${msg.author.tag}`)
            embed.setDescription(args.join(' '));

            TicketsChannel.send(embed)
            msg.reply('Your Ticket Has Been Submitted!!');
            msg.delete();

            resolve(`!${Utilities.camelCaseWord(module.exports.name)} Executed, No Errors`);
        });
	},
};