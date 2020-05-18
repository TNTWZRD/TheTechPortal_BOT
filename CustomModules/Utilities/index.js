/*
    Written By Daniel Jajliardo @ TheTechSphere 2020
    Random Functions for my Discord.JS Bot
    Currently returns a promise in order to make it Async
*/

const Discord = require('discord.js');

exports.getFileData = (file) => {
    var toReturn = null;
    var fs = require('fs');
    toReturn = fs.readFileSync(file, 'utf8', function(err, contents){
        if(!err) {
            return contents;
        }else {
            console.log(err);
            return false;
        }
    });
    return toReturn;
}

exports.updateFile = (file, NewData) => {
    success = true;
    var fs = require('fs');
    fs.writeFileSync(file, JSON.stringify(NewData, null, "\t"), function(err){
        if(err) {
            console.log(err);
            success = false;
        }
    });
    return success;
}

exports.getArgs = (msg) => {
    var RETURN = false
    var newReturn = [];
    var str = msg;

    // Get Options
    var options = str.match(/(\s[-]+.)/g)
    // Remove spaces
    if(options) options.forEach((val, index) => { options[index] = val.replace(' ', ''); });
    // Remove Options from str
    if(options && options.length >= 1) options.forEach(i => { str = str.replace(i, ''); });
    if(!options) options = [];

    RETURN = str.split(/"([^"]+)"|\s*([^"\s]+)/g)
    RETURN.forEach(element => {
        if(element && element != '' && element != ' ') newReturn.push(element)
    });
    RETURN = newReturn

    return {"ARGS":RETURN, "OPTIONS":options}
}

exports.splitCommands = (msg) => { return msg.split(';') }

async function embedMessage(Bot, msg, args, title, description, color, footer, killAfterTime = true, aliveTime = 30000){
    return new Promise((resolve, reject) => {
        let err = null;
        let embed = new Discord.MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter(footer);
        
        msg.channel.send(embed)
            .then(async msg => {
                for (emoji of ['❌']) await msg.react(emoji);

                var filter = (reaction, user) => reaction.emoji.name === '❌' && user.id != Bot.user.id;
                var collector = msg.createReactionCollector(filter, { time: aliveTime });
                collector.on('collect', r => collector.stop());
                collector.on('end', r => {
                    if(killAfterTime) msg.delete()
                });
            })
            .catch(console.error);
        
        if(!err) resolve();
        else reject("There was an error.");
    });
}
exports.embedMessage = embedMessage;

exports.readOptions = (Bot, msg, args, OPTIONS, CMD_NAME, HelpMsg) => { // <<--- ['-l', '-h', '-s']
    RETURN = { "LIST":false, "HELP": false, "STAY":false };
    if(OPTIONS && OPTIONS.length > 0){
        OPTIONS.forEach(e => {
            switch(e) {
                case '-l':
                    RETURN.LIST = true;
                break;
                case '-s':
                    RETURN.STAY = true;
                break;
                case '-h':
                    this.embedMessage(Bot, msg, args, `${Bot.user.username} : Command ${CMD_NAME}`, HelpMsg, "#00ff00", Bot.user.name, !OPTIONS.STAY);
                    RETURN.HELP = true;
                break;
            }
        });
    }
    return RETURN;
}