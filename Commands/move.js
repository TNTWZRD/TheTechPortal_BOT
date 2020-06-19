const Utilities = require('Utilities')
const LOGSystem = require('LOGSystem')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'move',
    aliases: ['m'],
    description: 'Move Song In Queue',
    help: '!Move <INDEX1> <INDEX2> : Move Swap Song Positions At Index 1 And Index 2',
    usage: `<INDEX1> <INDEX2>`,
    args: true, 
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
            
            if(!parseInt(args[0]) || !parseInt(args[1])){
                msg.reply('Please Use Integer Indexes'); 
                return reject('Not Integers'); }
            
            var tmp = Bot.MusicQueue.get(msg.guild.id).songs[parseInt(args[0])];
            Bot.MusicQueue.get(msg.guild.id).songs[parseInt(args[0])] = Bot.MusicQueue.get(msg.guild.id).songs[parseInt(args[1])];
            Bot.MusicQueue.get(msg.guild.id).songs[parseInt(args[1])] = tmp;

            msg.reply('The Songs Have Been Swapped!!');

            resolve("!Move Executed, No Errors");
        });
    },
};