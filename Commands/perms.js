const Utilities = require('Utilities')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'perms',
    aliases: ['permissions'],
    description: 'Modify Permissions for @USER',
    help: '!perms <@USER> <EVERYONE|GENERAL|MODERATOR|ADMIN>: Add Or Remove Permissions for user',
    usage: `<@USER> <EVERYONE|GENERAL_USER|MODERATOR|ADMIN>`,
    args: true,
    guildOnly: true,
    minPermissions: "ADMIN",
    module: Config.MODULES.MODERATION,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            // Check to see if we have permissions to run this command
            if(!(await Utilities.hasPermissions(Bot, msg.author.id, "ADMIN"))){
                msg.reply("You do not have the permissions to run this command");
                return reject("Insufficient Permissions") }
            
            // Check to see if Permission Specified
            if(!args[1]){
                msg.reply("No Permission Specified");
                return reject("Permission Not Specified") }
            
            // Make Sure Admins cant give ADMIN or OWNER, But OWNERS can
            if(args[1] == "ADMIN" || args[1] == "OWNER"){
                if(!(await Utilities.hasPermissions(Bot, msg.author.id, "OWNER"))){
                    msg.reply("You do not have the permissions to give ADMIN or OWNER");
                    return reject("Insufficient Permissions to give ADMIN or OWNER") }
            }
            
            // Condition
            let target = msg.mentions.members.first();
            if(!target){
                msg.reply("@USER not mentioned, please mention user to preform this command.");
                return reject("@USER not mentioned") }

            // Make sure we arn't modifying server owner
            if(target.id == msg.guild.ownerID){
                msg.reply("You canno\'t Modify Server Owner Permissions");
                return reject("Tried to modify GuildOwner") }
            
            switch(args[1]){
                case 'EVERYONE':
                    Utilities.SetUserValue(msg.guild.id, target.id, "PermissionsLevel", 0);
                    break;
                case 'GENERAL':
                    Utilities.SetUserValue(msg.guild.id, target.id, "PermissionsLevel", 1);
                    break;
                case 'MODERATOR':
                    Utilities.SetUserValue(msg.guild.id, target.id, "PermissionsLevel", 3);
                    break;
                case 'ADMIN':
                    Utilities.SetUserValue(msg.guild.id, target.id, "PermissionsLevel", 7);
                    break;
                case 'OWNER':
                    Utilities.SetUserValue(msg.guild.id, target.id, "PermissionsLevel", 15);
                    break;
                default:
                    msg.reply("ERROR: Check your command syntax, something went wrong")
                    return reject("SYNTAX Error.");
            }
            
            msg.reply(`Member ${target}, PERMISSIONS Updated.`)

            resolve("!perms Executed, No Errors");
        });
	},
};