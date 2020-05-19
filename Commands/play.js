const Utilities = require('Utilities')
const YTDL = require('ytdl-core')
const LOGSystem = require('LOGSystem')

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Play music or YT Audio',
    help: '!play <URL> (OPTIONS): Used to play audio streams',
    usage: `<URL>`,
    execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;
            const USERS = Bot.ServerData.USERS

            getSong(Bot, msg, args, OPTIONS, Bot.MusicQueue.get(msg.guild.id));

            resolve("!Play Executed, No Errors");
        });
    },
};

async function getSong(Bot, msg, args, options, serverQueue){
    YTDL.getInfo(args[0], {filter: 'audioonly'}, (err, info) => {
        if(err) throw err;
        song = { title: info.title, url: info.video_url }
        execute(Bot, msg, args, options, serverQueue, song)
    });
}

async function execute(Bot, msg, args, options, serverQueue, song){
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) return msg.channel.send("You need to be in a voice channel to play music!");

    if(!Bot.MusicQueue.get(msg.guild.id)){
        const queueConstruct = {
            textChannel: msg.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
           };
           // Setting the queue using our contract
           Bot.MusicQueue.set(msg.guild.id, queueConstruct);
           // Pushing the song to our songs array
           Bot.MusicQueue.get(msg.guild.id).songs.push(song);
           
           try {
            // Here we try to join the voicechat and save our connection into our object.
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            // Calling the play function to start a song
            play(Bot, msg.guild, queueConstruct.songs[0]);
           } catch (err) {
            // Printing the error message if the bot fails to join the voicechat
            LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'Play, Execute')
            Bot.MusicQueue.delete(msg.guild.id);
            return msg.channel.send(err);
           }
    }else{
        Bot.MusicQueue.get(msg.guild.id).songs.push(song)
        LOGSystem.LOG(JSON.stringify(Bot.MusicQueue.get(msg.guild.id).songs), LOGSystem.LEVEL.MUSIC, 'execute play')
        return msg.channel.send(`${song.title} has been added to the queue!`);
    }
}

function play(Bot, guild, song){
    if(!song){
        Bot.MusicQueue.get(guild.id).voiceChannel.leave();
        Bot.MusicQueue.delete(guild.id);
        return;
    }
    const dispatcher = Bot.MusicQueue.get(guild.id).connection
        .play(YTDL(song.url))
        .on("finish", () => {
            Bot.MusicQueue.get(guild.id).songs.shift();
            play(Bot, guild, Bot.MusicQueue.get(guild.id).songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(Bot.MusicQueue.get(guild.id).volume / 5);
    Bot.MusicQueue.get(guild.id).textChannel.send(`Start playing: **${song.title}**`);
    LOGSystem.LOG(JSON.stringify(Bot.MusicQueue.get(guild.id).songs), LOGSystem.LEVEL.MUSIC, 'PLAY')
}