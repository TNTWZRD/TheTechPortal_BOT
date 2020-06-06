const Utilities = require('Utilities')
const Discord = require('discord.js');

module.exports = {
    name: 'userinfo',
    aliases: ['info'],
    description: 'Get User Info',
    help: '!userinfo (@USER): Get User Info',
    usage: `(@USER)`,
    args: false,
    guildOnly: true,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            if(args[0]){
                var target = msg.mentions.members.first();
                if(!target){
                    msg.reply("You must mention user you would like information about!!");
                    reject("No mentions."); }
            }else{
                var target = msg.guild.member(msg.author.id);
            }

            var data = [];
            var embed = new Discord.MessageEmbed();
            embed.setTitle(`User Info For: ${target.displayName}`);
            embed.setThumbnail(target.user.avatarURL({format:'jpeg', dynamic:true, size:4096 }));

            data.push(`USER: ${target.user.username} (${target.user.id})`);
            data.push(`Is Bot: ${target.user.bot}`);
            data.push(`Avatar: \`\`${target.user.avatarURL({format:'jpeg', dynamic:true, size:4096 })}\`\``);

            data.push('Has Roles:');
            target.roles.cache.forEach(e => {
                if(e.name != '@everyone') data.push(`-- \`\`${e.name}\`\``);
            });

            embed.setDescription(data);
            embed.setFooter(`Data provided by: ${msg.client.user.username}`);

            msg.channel.send(embed);

            resolve("!UserInfo Executed, No Errors");
        });
	},
};