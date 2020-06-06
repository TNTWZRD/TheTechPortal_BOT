const Utilities = require('Utilities')

module.exports = {
    name: 'mute',
    aliases: ['silence'],
    description: 'Mute a user',
    help: '!mute <@USER> : Mute a user',
    usage: `<@USER>`,
    args: true,
    guildOnly: true,
    minPermissions: "MODERATOR",
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            // Check for permissions:
            if(! (await Utilities.hasPermissions(Bot, msg.author.id, "MODERATOR"))){
                msg.reply("You do not have permissions to run this command")
                return reject("Insufficient permissions"); }
            
            // Get Target User
            var target = msg.mentions.members.first();
            if(!target){
                msg.reply("You must specify a user to mute")
                return reject("Didn't Specify User"); }
            // Make sure target is not Author
            if(target.id == msg.author.id){
                msg.reply("You Cant Mute Yourself")
                return reject("Tried to mute self"); }
            // Make sure target isnt OP
            if(await Utilities.hasPermissions(Bot, target.id, "MODERATOR")){
                msg.reply("You Cant Mute MODERATORS")
                return reject("Tried to mute a moderator"); }

            // Get MUTE Role
            var muteRole = msg.guild.roles.cache.filter(role => role.name == "MUTED");
            if(!muteRole){
                msg.reply("NO \"MUTED\" Role.")
                return reject("No Muted Role, Cant mute People"); }
            
            // Get target roles
            var userRoles = msg.guild.member(target).roles.cache
            if(!(userRoles.get(muteRole.firstKey()))){
                msg.guild.member(target).roles.add(muteRole)
                    .catch(err => reject(err))
                if(msg.guild.member(target).voice.connection && !msg.guild.member(target).voice.mute) msg.guild.member(target).voice.setMute(true, "You have been unmuted")
                    .catch(err => reject(err))
                msg.channel.send(`${target}, YOU HAVE BEEN MUTED!`)
            }else{
                msg.guild.member(target).roles.remove(muteRole)
                    .catch(err => reject(err))
                if(msg.guild.member(target).voice.connection && msg.guild.member(target).voice.mute) msg.guild.member(target).voice.setMute(false, "You have been unmuted")
                    .catch(err => reject(err))
                msg.channel.send(`${target}, YOU HAVE BEEN UNMUTED!`)
            }

            resolve("!Mute Executed, No Errors");
        });
	},
};