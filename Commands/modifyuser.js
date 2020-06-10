const Utilities = require('Utilities')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'modifyuser',
    aliases: ['moduser', 'edituser'],
    description: 'Modify User Data',
    help: '!modifyuser <@USER> <PARAMETER> <NEWVALUE>: Change @User Paramter to NewValue',
    usage: `<@USER> <PARAMETER> <NEWVALUE>`,
    args: true,
    guildOnly: true,
    minPermissions: "ADMIN",
    module: Config.MODULES.SYSTEM,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            // Condition
            if(!(await Utilities.hasPermissions(Bot, msg.author.id, "ADMIN"))){
                msg.reply("You do not have the permissions to run this command");
                return reject("Insufficient Permissions") }
            
            if(OPTIONS.LIST){
                msg.reply("Run !stats <@USER>, to see available Parameters. Username & PermissionsLevel. Not Editable By !modifyuser");
                return reject("Insufficient Permissions") }

            var target = null
            if(args[0]) {
                target = msg.mentions.members.first()
            }else{
                msg.reply("you must mention a user to edit")
                return false; }
            
            if(!target){
                msg.reply("you must mention a user to edit")
                return false; }
        
            if(!args[1] || !args[2]) msg.reply("Missing Arguments CHECK !modifyuser -h");
            
            switch(args[1]){
                case 'USERNAME':
                    msg.reply("Not Editable By Commands");
                    break;
                case 'PermissionsLevel':
                    msg.reply("Not Editable By Commands");
                    break;
                case 'EXP':
                    Utilities.SetUserValue(msg.guild.id, target.id, "EXP", parseInt(args[2]));
                    msg.reply("Settings Updated")
                break;
                case 'WARNINGS':
                    Utilities.SetUserValue(msg.guild.id, target.id, "Warnings", parseInt(args[2]));
                    msg.reply("Settings Updated")
                break;
            }

            resolve("!Clear Executed, No Errors");
        });
	},
};