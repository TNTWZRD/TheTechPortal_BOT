const Utilities = require('Utilities')
const LOGSystem = require('LOGSystem');
const { Util } = require('discord.js');
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'shuffle',
    aliases: [],
    description: 'Shuffle Entire Song Queue',
    help: '!Shuffle : Shuffle Entire Song Queue',
    usage: ``,
    args: false, 
    guildOnly: true,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.MUSIC,
    execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            if(!Bot.MusicQueue.get(msg.guild.id)) {
                msg.reply('There Is No Song Queue.'); 
                return reject('No Song Queue'); }
            
            Bot.MusicQueue.get(msg.guild.id).songs = Utilities.shuffleArray(Bot.MusicQueue.get(msg.guild.id).songs);

            msg.reply('The Queue Has been Shuffled!!');

            resolve("!Shuffle Executed, No Errors");
        });
    },
};