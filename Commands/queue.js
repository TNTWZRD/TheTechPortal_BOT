const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const YTDL = require('ytdl-core')
const LOGSystem = require('LOGSystem')
const Discord = require('discord.js')
const { brotliCompress } = require('zlib')
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

            if(!Bot.MusicQueue.get(msg.guild.id)) {
                msg.reply('There Is No Song Queue.'); 
                return reject('No Song Queue'); }

            if(!Bot.MusicQueue.get(msg.guild.id).QueueListMoving == true) Bot.MusicQueue.get(msg.guild.id).QueueListPage = 0;

            if(!Bot.MusicQueue.get(msg.guild.id).QueueListPage) Bot.MusicQueue.get(msg.guild.id).QueueListPage = 0;
            
            Bot.MusicQueue.get(msg.guild.id).QueueListMoving = false;
            var page = Bot.MusicQueue.get(msg.guild.id).QueueListPage;
            var lastPage = Math.floor(Object.keys(Bot.MusicQueue.get(msg.guild.id).songs).length/26);

            var data = [];
            Bot.MusicQueue.get(msg.guild.id).songs.forEach((value, index) => {
                if (index == 0) data.push(`Playing : ${value.title}`);
                else if(index > (page*26) && index <= (26*page+26)) data.push(`${index} : ${Utilities.trim(value.title, 70)}`);
            });

            const embed = new Discord.MessageEmbed()
                .setColor('#EFFF00')
                .setTitle(`Current Music Queue, Page ${page+1}/${lastPage+1}`)
                .setDescription(data);

            msg.channel.send(embed)
                .then(async _msg => {
                    for (emoji of ['⏪', '⬅', '➡', '⏩', '🔀']) await _msg.react(emoji);

                    var filter = (reaction, user) => (reaction.emoji.name === '⏪') && user.id != Bot.user.id;
                    var collectorBeginning = _msg.createReactionCollector(filter, { time: 30000 });
                    collectorBeginning.on('collect', async r => {
                        Bot.MusicQueue.get(msg.guild.id).QueueListPage = 0;
                        kill(Bot, _msg, msg, _args);
                    });
                    var filter = (reaction, user) => (reaction.emoji.name === '⬅') && user.id != Bot.user.id;
                    var collectorBack = _msg.createReactionCollector(filter, { time: 30000 });
                    collectorBack.on('collect', r => {
                        if(page >= 1) Bot.MusicQueue.get(msg.guild.id).QueueListPage = page - 1;
                        kill(Bot, _msg, msg, _args);
                    });
                    var filter = (reaction, user) => (reaction.emoji.name === '➡') && user.id != Bot.user.id;
                    var collectorForward = _msg.createReactionCollector(filter, { time: 30000 });
                    collectorForward.on('collect', r => {
                        if(page < lastPage) Bot.MusicQueue.get(msg.guild.id).QueueListPage = page + 1;
                        kill(Bot, _msg, msg, _args);
                    });
                    var filter = (reaction, user) => (reaction.emoji.name === '⏩') && user.id != Bot.user.id;
                    var collectorEnd = _msg.createReactionCollector(filter, { time: 30000 });
                    collectorEnd.on('collect', r => {
                        Bot.MusicQueue.get(msg.guild.id).QueueListPage = lastPage;
                        kill(Bot, _msg, msg, _args);
                    });
                    var filter = (reaction, user) => (reaction.emoji.name === '🔀') && user.id != Bot.user.id;
                    var collectorShuffle = _msg.createReactionCollector(filter, { time: 30000 });
                    collectorShuffle.on('collect', async r => {
                        await Bot.commands.get('shuffle').execute(Bot, msg, _args);
                        kill(Bot, _msg, msg, _args);
                    });
                })
                .catch(console.error);

            resolve("!Queue Executed, No Errors");
        });
    },
};

function kill(Bot, _msg, msg, _args){
    _msg.delete();
    Bot.MusicQueue.get(msg.guild.id).QueueListMoving = true;
    Bot.commands.get('queue').execute(Bot, msg, _args);
}