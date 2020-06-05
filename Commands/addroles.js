const Utilities = require('Utilities')

module.exports = {
    name: 'addroles',
    aliases: ['+role', '+roles', 'addrole'],
    description: 'Add role to user/self',
    help: '!+role (@USER) <@ROLE>: Add role to user/self',
    usage: `(@USER) <@ROLE>`,
    args: true,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;
            const USERS = Bot.ServerData.USERS

            var target = msg.mentions.members.first();
            if(target && !Utilities.hasPermissions(Bot, msg.author.id, "MODERATOR")){
                msg.reply("You do not have permissions to run this command on other people");
                return reject("Insufficient permissions to add role to another user."); }
            
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

            if(isAdmin && !(Utilities.hasPermissions(Bot, msg.author.id, "OWNER"))){
                msg.reply("You do not have permissions to add ADMIN roles");
                return reject("Tried to add admin role."); }

            var userRoles = msg.guild.member(target).roles
            if((userRoles.cache) && (userRoles.cache.has(role.id))){
                msg.channel.send("User Already member of this role!!")
                return resolve("User already in role") }
            
            msg.guild.member(target).roles.add(role)
                .then(() => { 
                    msg.channel.send(`${target}, You are now a part of \`\`${role}\`\`!`)
                 })
                .catch(err => reject(err));

            resolve("!+Role Executed, No Errors");
        });
	},
};