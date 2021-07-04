const Utilities = require('Utilities')
const YTDL = require('ytdl-core')
const LOGSystem = require('LOGSystem')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'stop',
    aliases: ['x'],
    description: 'Stop currently playing song',
    help: '!Stop : Stop Song',
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.MUSIC,
    execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            if (!msg.member.voice.channel)
                return msg.channel.send(
                "You have to be in a voice channel to stop the music!"
                );
                
            Bot.MusicQueue.get(msg.guild.id).songs = [];
            Bot.MusicQueue.get(msg.guild.id).connection.dispatcher.end();

            resolve("!Stop Executed, No Errors");
        });
    },
};