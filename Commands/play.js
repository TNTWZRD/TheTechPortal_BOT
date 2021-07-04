const Utilities = require('Utilities');
const fetch = require('node-fetch');
const querystring = require('querystring');
const YTDL = require('ytdl-core');
const Discord = require('discord.js');
const LOGSystem = require('LOGSystem');
const Config = require(process.cwd() + '/config.json');
const HttpsProxyAgent = require('https-proxy-agent');

var ProxySettings = null;
var agent = null;

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Play YouTube Video, Playlist, Or Search for song',
    help: '!play <URL> || <SEARCH STRING>: Play YouTube Video, Playlist, Or Search for song',
    usage: `<URL>`,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.MUSIC,

    execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {

            ProxySettings = require(process.cwd() + '/proxySettings.json');
            
            agent = HttpsProxyAgent(`http://${ProxySettings.CurrentProxy[0]}:${ProxySettings.CurrentProxy[0]}`);
            //     ip: ProxySettings.CurrentProxy[0],   // IP
            //     port: ProxySettings.CurrentProxy[1], // PORT
            // });

            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            getSong(Bot, msg, args, OPTIONS, Bot.MusicQueue.get(msg.guild.id), _args);

            resolve("!Play Executed, No Errors");
        });
    },
};

async function getSong(Bot, msg, args, options, serverQueue, _args){
    if(args[0].match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/)){
        // Is URL Try Get Song
        if(args[0].match('playlist') || args[0].match('list')){ // Is Playlist
            getPlaylist(Bot, msg, args, options, serverQueue);

        }else{ // Indiviual Song URL
            ytdl_proxied(args[0], Bot, msg, args, options, serverQueue)
        }
    }else{
        // Not URL Search UTube

        var querry = querystring.stringify({
            q:args.join(' '),
            key:Config.youtubeAPIKey
        });
        var searchResults = await fetch(`https://www.googleapis.com/youtube/v3/search?${querry}`).then(r => r.json());
        ytdl_proxied(`https://www.youtube.com/watch?v=${searchResults.items[0].id.videoId}`, Bot, msg, args, options, serverQueue);
    }
}

async function getPlaylist(Bot, msg, args, options, serverQueue){
    return new Promise(async (resolve, reject) => {
        var songsToAdd = [];
        var playlistID = querystring.parse(args[0].replace(/^.*\?/, ''))
        var querry = querystring.stringify({
            part:"snippet",
            playlistId:playlistID.list,
            key:Config.youtubeAPIKey, 
            maxResults: 50
        });
        var searchResults = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${querry}`).then(r => r.json());
        searchResults.items.forEach(item => { 
            songsToAdd.push(`https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`); 
        });

        while(searchResults.nextPageToken != null){
            var querry = querystring.stringify({
                part:"snippet",
                playlistId:playlistID.list,
                key:Config.youtubeAPIKey, 
                maxResults: 50,
                pageToken:searchResults.nextPageToken
            });
            var searchResults = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${querry}`).then(r => r.json());
            console.log(searchResults.nextPageToken)
            searchResults.items.forEach(item => { 
                songsToAdd.push(`https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`); 
            });
        }

        // NEED CODE IF MULTIPLE PAGES OF SONGS

        songsToAdd.forEach(e => {
            ytdl_proxied(e, Bot, msg, args, options, serverQueue);
        });
        msg.channel.send(`Queued ${songsToAdd.length} Songs!`)
        resolve();
    });
}

async function ytdl_proxied(URL, Bot, msg, args, options, serverQueue){
    // Run YTDL, and change proxies every 100 Lookups
    if(ProxySettings.CurrentProxySongCount >= ProxySettings.SongsBeforeChangeProxy){
        ProxySettings.CurrentProxySongCount = 0;
        if(ProxySettings.ProxyIndex > Config.ProxyList.length) ProxySettings.ProxyIndex = 0;
        
        var results = await fetch(`https://api.getproxylist.com/proxy?protocol[]=http`)
            .then(response => response.json());
            
        ProxySettings.CurrentProxy[0] = results.ip;
        ProxySettings.CurrentProxy[1] = results.port;

        agent = HttpsProxyAgent(`http://${ProxySettings.CurrentProxy[0]}:${ProxySettings.CurrentProxy[0]}`);
        Utilities.setFileData("proxySettings.json", ProxySettings);
    }

    var success = false;
    await YTDL.getInfo(URL, {filter: 'audioonly' /*, requestOptions: { agent } */}, (err, info) => {
        if(!err){
            song = { title: info.title, url: info.video_url }
            success = true;
            execute(Bot, msg, args, options, serverQueue, song, true);
        }
        else LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'YTDL_Proxied');
    });
    if(success == false) {
        console.log('Failed');
        ProxySettings.CurrentProxySongCount = 0;
        var results = await fetch(`https://api.getproxylist.com/proxy?protocol[]=http`)
            .then(response => response.json());
            
        ProxySettings.CurrentProxy[0] = results.ip;
        ProxySettings.CurrentProxy[1] = results.port;
        agent = HttpsProxyAgent({
            ip: ProxySettings.CurrentProxy[0],   // IP
            port: ProxySettings.CurrentProxy[1], // PORT
        });
        Utilities.setFileData("proxySettings.json", ProxySettings);
        ytdl_proxied(URL); // Try Again
    }
}

async function execute(Bot, msg, args, options, serverQueue, song, PLAYLIST = false){
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
        msg.channel.send("You need to be in a voice channel to play music!");
        LOGSystem.LOG("You need to be in a voice channel to play music!", LOGSystem.LEVEL.ERROR, 'Play - Execute') }

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
        LOGSystem.LOG('Added: '+JSON.stringify(song)+' To the Queue!', LOGSystem.LEVEL.MUSIC, 'execute play')
        if(!PLAYLIST) msg.channel.send(`${song.title} has been added to the queue!`);
        return;
    }
}

function play(Bot, guild, song){
    if(!song){
        Bot.MusicQueue.get(guild.id).voiceChannel.leave();
        Bot.MusicQueue.delete(guild.id);
        return;
    }
    ProxySettings.CurrentProxySongCount += 0;
    Utilities.setFileData("proxySettings.json", ProxySettings);

    const dispatcher = Bot.MusicQueue.get(guild.id).connection
        .play(YTDL(song.url, /*{ requestOptions: { agent } }*/))
        .on("finish", () => {
            Bot.MusicQueue.get(guild.id).songs.shift();
            play(Bot, guild, Bot.MusicQueue.get(guild.id).songs[0]);
        })
        .on("error", error => console.error(error));
        dispatcher.setVolumeLogarithmic(Bot.MusicQueue.get(guild.id).volume / 5);
        if(!Bot.MusicQueue.get(guild.id).playingMsgId || Bot.MusicQueue.get(guild.id).textChannel.lastMessageID != Bot.MusicQueue.get(guild.id).playingMsgId){ 
            const embed = new Discord.MessageEmbed()
                .setColor('#EFFF00')
                .setTitle('Now Playing:')
                .setDescription(Bot.MusicQueue.get(guild.id).songs[0].title);
            Bot.MusicQueue.get(guild.id).textChannel.send(embed).then(value => Bot.MusicQueue.get(guild.id).playingMsgId = value.id);
        }else{
            const embed = new Discord.MessageEmbed()
                .setColor('#EFFF00')
                .setTitle('Now Playing:')
                .setDescription(Bot.MusicQueue.get(guild.id).songs[0].title);
            Bot.MusicQueue.get(guild.id).textChannel.messages.resolve(Bot.MusicQueue.get(guild.id).playingMsgId).edit(embed);
        }   
}