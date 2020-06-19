const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const YTDL = require('ytdl-core')
const LOGSystem = require('LOGSystem')
const Discord = require('discord.js')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'queue',
    aliases: ['q'],
    description: 'View The Queue',
    help: '!Queue: View The queue',
    usage: ``,
    args: false, 
    guildOnly: true,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.MUSIC,
    execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            var data = [];
            Bot.MusicQueue.get(msg.guild.id).songs.forEach((value, index) => {
                if (index == 0) data.push(`Playing : ${value.title}`);
                else if(index <= 50) data.push(`${index} : ${value.title}`);
            });

            const embed = new Discord.MessageEmbed()
                .setColor('#EFFF00')
                .setTitle('Current Music Queue')
                .setDescription(data);

            msg.channel.send(embed);

            resolve("!Queue Executed, No Errors");
        });
    },
};