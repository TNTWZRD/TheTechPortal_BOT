const Utilities = require('Utilities')
const YTDL = require('ytdl-core')
const LOGSystem = require('LOGSystem')

module.exports = {
    name: 'skip',
    aliases: ['s', '>'],
    description: 'Skip currently playing song',
    help: '!skip : Skip Song',
    minPermissions: "GENERAL_USER",
    execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            if (!msg.member.voice.channel)
                return msg.channel.send(
                "You have to be in a voice channel to stop the music!"
                );
            if (!Bot.MusicQueue.get(msg.guild.id))
                return msg.channel.send("There is no song that I could skip!");
            Bot.MusicQueue.get(msg.guild.id).connection.dispatcher.end();

            resolve("!Skip Executed, No Errors");
        });
    },
};