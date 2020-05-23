const Utilities = require('Utilities')
const YTDL = require('ytdl-core')
const LOGSystem = require('LOGSystem')

module.exports = {
    name: 'stop',
    aliases: ['x'],
    description: 'Stop currently playing song',
    help: '!Stop : Stop Song',
    minPermissions: "GENERAL_USER",
    execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;
            const USERS = Bot.ServerData.USERS

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