const Utilities = require('Utilities');
const Discord = require('discord.js');
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'poll',
    aliases: ['p'],
    description: 'Create Server Wide Yes/No Poll',
    help: '!poll <TITLE> <DESCRIPTION> (TIME:30): Create Server Wide Yes/No Poll',
    usage: `<TITLE> <DESCRIPTION> (TIME:30)`,
    args: true,
    guildOnly: true,
    minPermissions: "MODERATOR",
    module: Config.MODULES.FUN,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            if(!(await Utilities.hasPermissions(Bot, msg.author.id, "MODERATOR"))){
                msg.reply("You Don't have permission to run this command.");
                return reject("Insufficient Permissions"); }
            
            if(!args[0] || !args[1]){
                msg.reply("Not Enough Arguments!!");
                return reject("Insufficient Arguments"); }

            var timeOut = 30;
            if(args[2]) timeOut = parseInt(args[2]);
            timeOut = timeOut * 10000; // Convert 30 to 18000 < Minutes conversion

            var data = [];
            data.push(args[1]);
            data.push(`\n**React Below to Vote!**`)

            let err = null;
            var embed = new Discord.MessageEmbed()
                .setTitle(args[0])
                .setDescription(data)
                .setColor("#ff6600")
                .setFooter(`Poll Created By: ${msg.author.tag}`);
            var author = msg.author.tag;

            wantedEmoji = [{name:"👍"}, {name: "👎"}];
            if(args[3]) wantedEmoji = JSON.parse(args[3]); //['', '', ...]

            msg.channel.send(embed)
                .then(async msg => {
                    for (emoji of wantedEmoji) await msg.react(emoji.name);
                    var polls = {};
                    wantedEmoji.forEach(e=>{
                        polls[e.name] = [];
                    });
    
                    var filter   = (reaction, user) => user.id != Bot.user.id;
                    var collector = msg.createReactionCollector(filter, { max: 9999, maxEmojis: 9999, maxUsers: 9999, time: timeOut });
                    collector.on('collect', r => {
                        Object.keys(polls).forEach(e=>{
                            polls[e].pop(r.message.author.id);
                        });
                        if(!Object.keys(polls).includes(r._emoji.name)) polls[r._emoji.name] = [];
                        polls[r._emoji.name].push(r.message.author.id);
                    });
                    
                    collector.on('end', async r => {
                        msg.delete();
                        var data = [];
                        data.push(args[1]);
                        data.push(`Results:`);
                        await Object.keys(polls).forEach(async e=>{
                            var tmpEmoji = await msg.client.emojis.cache.find(emoji => emoji.name == e);
                            if (!tmpEmoji) tmpEmoji = `${e}`;
                            data.push(`${tmpEmoji} : ${polls[e].length}`)
                        });

                        var embed = new Discord.MessageEmbed()
                            .setTitle(`Poll Finished: ${args[0]}`)
                            .setDescription(data)
                            .setColor("#ff0000")
                            .setFooter(`Poll Created By: ${author}`);
                        msg.channel.send(embed);
                    });
                })
                .catch(console.error);
            
            resolve("!Poll Executed, No Errors");
        });
	},
};