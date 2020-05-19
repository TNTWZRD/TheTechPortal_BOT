/*
    Written By Daniel Jajliardo @ TheTechSphere 2020
    Random Functions for my Discord.JS Bot
    Currently returns a promise in order to make it Async
*/

const Discord = require('discord.js');
const LOGSystem = require('LOGSystem')
var fs = require('fs');
var config = require('../../config.json');

const ServerDirectory = "./Servers/";

exports.addUsers = (Bot, msg) => {
    return new Promise(resolve => {
        var guildId = msg.guild.id;
        var UsersAdded = [];
        var err = "";
        
        // Check for @Mentions

        msg.mentions.members.forEach(e => {
            // Check Every Message Author to see if is in database
            if (!(e.user.id in Bot.ServerData.USERS)){
                Bot.ServerData.USERS[e.user.id] = {
                    "Username":e.user.tag,
                    "PermissionsLevel":0, // Default to EVERYONE
                    "EXP":1,
                    "Warnings":0
                }
                if(msg.guild.ownerID == e.user.id) Bot.ServerData.USERS[e.user.id].PermissionsLevel = 15 // Make Owner
                UsersAdded.push(e.user.tag);
            }
        });
    
        // Check Every Message Author to see if is in database
        if (!(msg.author.id in Bot.ServerData.USERS)){
            Bot.ServerData.USERS[msg.author.id] = {
                "Username":msg.author.tag,
                "PermissionsLevel":0, // Default to EVERYONE
                "EXP":1,
                "Warnings":0
            }
            if(msg.guild.ownerID == msg.author.id) Bot.ServerData.USERS[msg.author.id].PermissionsLevel = 15 // Make Owner
            UsersAdded.push(msg.author.tag);
        }else Bot.ServerData.USERS[msg.author.id].EXP += 1;

        if(UsersAdded.length) resolve("Added Users: " + JSON.stringify(UsersAdded));
        else if(err == '') resolve()
    });
};

exports.getServerData = (guildId) => {
    var loc = ServerDirectory+guildId+"_server.json"
    var toReturn = null;
    if(fs.existsSync(loc)){
        toReturn = fs.readFileSync(loc, 'utf8', function(err, contents){
            if(!err) {
                return contents;
            }else {
                LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'getServerData');
                return false;
            }
        });
    }else{
        var USERS = { "EMPTY":null };
        this.SetServerData(guildId, { "SETTINGS": config.BasicSettings, "USERS": new Object } );
    }
    return toReturn;
}

exports.SetServerData = (guildId, NewData) => {
    success = true;
    fs.writeFileSync(ServerDirectory+guildId+"_server.json", JSON.stringify(NewData, null, "\t"), function(err){
        if(err) {
            LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'getServerData');
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