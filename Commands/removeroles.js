const Utilities = require('Utilities')

module.exports = {
    name: 'removeroles',
    aliases: ['-role', '-roles', 'removerole'],
    description: 'Remove role to user/self',
    help: '!+role (@USER) <@ROLE>: Remove role to user/self',
    usage: `(@USER) <@ROLE>`,
    args: true,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            var target = msg.mentions.members.first();
            if(target && !Utilities.hasPermissions(Bot, msg.author.id, "MODERATOR")){
                msg.reply("You do not have permissions to run this command on other people");
                return reject("Insufficient permissions to remove role from another user."); }
            
            // Get User
            if(!target) target = msg.author
            else target = target.user

            // Check if role mentioned
            var role = msg.mentions.roles.first();
            if(!role){
                msg.reply("Role not mentioned please mention the role.");
                return reject("Role not mentioned"); }
            
            // Check if ROLE is ADMIN
            var isAdmin = false;
            isAdmin = false;
            test = [8, 32, 268435456, 16, 2, 4, 536870912, 8162, 128]; // ADMIN PRIVILEGES
            test.forEach(i => { if(role.permissions.has(i)) isAdmin = true; });

            if(Bot.SETTINGS.ServerRole_GENERAL_USER){
                if(role.id == Bot.SETTINGS.ServerRole_GENERAL_USER.id && !(Utilities.hasPermissions(Bot, msg.author.id, "MODERATOR"))){
                    msg.reply("You do not have permission to remove this role.");
                    return reject("User tried to remove: ServerRole_GENERAL_USER");
            }}

            if(isAdmin && !(Utilities.hasPermissions(Bot, msg.author.id, "OWNER"))){
                msg.reply("You do not have permissions to remove ADMIN roles");
                return reject("Tried to remove admin role."); }

            var userRoles = msg.guild.member(target).roles
            if(!(userRoles.cache) || !(userRoles.cache.has(role.id))){
                msg.channel.send("User is not member of this role!!")
                return resolve("User not in role") }
            
            msg.guild.member(target).roles.remove(role)
                .then(() => { 
                    msg.channel.send(`${target}, You are no longer a part of \`\`${role.name}\`\`!`)
                 })
                .catch(err => reject(err));
            
            resolve("!-Role Executed, No Errors");
        });
	},
};