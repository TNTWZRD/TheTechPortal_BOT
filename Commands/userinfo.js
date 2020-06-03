const Utilities = require('Utilities')
const Discord = require('discord.js');

module.exports = {
    name: 'userinfo',
    aliases: ['info'],
    description: 'Get User Info',
    help: '!userinfo <@USER>: Get User Info',
    usage: `<@USER>`,
    args: true,
    guildOnly: true,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;
            const USERS = Bot.ServerData.USERS

            var target = msg.mentions.members.first();
            if(!target){
                msg.reply("You must mention user you would like information about!!");
                reject("No mentions."); }

                console.log(JSON.stringify(target.roles.cache, null, `\t`))

            var data = [];
            var embed = new Discord.MessageEmbed();
            embed.setTitle(`User Info For: ${target.displayName}`);
            embed.setThumbnail(target.user.avatarURL({format:'jpeg', dynamic:true, size:4096 }));

            data.push(`USER: ${target.user.username} (${target.user.id})`);
            data.push(`Is Bot: ${target.user.bot}`);
            data.push(`Avatar: \`\`${target.user.avatarURL({format:'jpeg', dynamic:true, size:4096 })}\`\``);

            data.push('Has Roles:');
            target.roles.cache.forEach(e => {
                data.push(`-- ${e.name}`);
            });


            embed.setDescription(data);
            embed.setFooter(`Data provided by: ${msg.client.user.username}`);

            msg.channel.send(embed);

            resolve("!UserInfo Executed, No Errors");
        });
	},
};