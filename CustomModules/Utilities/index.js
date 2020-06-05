/*
    Written By Daniel Jajliardo @ TheTechSphere 2020
    Random Functions for my Discord.JS Bot
    Currently returns a promise in order to make it Async
*/

const Discord = require('discord.js');
const LOGSystem = require('LOGSystem')
var fs = require('fs');
var config = require('../../config.json');
const mysql = require('mysql');

const ServerDirectory = "./Servers/";

var connection = mysql.createConnection({
    host: config.MYSQL.HOST,
    user: config.MYSQL.USER,
    password: config.MYSQL.PASSWORD,
    database: config.MYSQL.DB
});

connection.connect(function(err){
    if(err) throw err;
    console.log("Connected!!");
});

exports.GetServer = (ServerID, ServerName) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM \`Servers\` WHERE \`SUID\` = '${ServerID}'`;
        var response = null;
        connection.query(query, (err, result) => {
            if(err) reject(err);
                if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0])));
                else{
                    var query = `INSERT INTO \`Servers\`(\`SUID\`, \`ServerName\`) VALUES ('${ServerID}','${ServerName}')`;
                    connection.query(query, function(err, result, fields){
                        if(err) reject(err);
                        if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0])));
                    });
                }
            });
    });
};

exports.trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);

exports.hasPermissions = (Bot, USERID, LEVEL) => { return (Bot.ServerData.USERS[USERID].PermissionsLevel & Bot.PERMS[LEVEL]); }

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

var base = 36;

exports.getServerData = (guild) => {
    var loc = ServerDirectory+guild.id+"_server.json"
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
        this.SetServerData(guild.id, { "ServerName": guild.name, "SETTINGS": config.BasicSettings, "USERS": {} } );
        toReturn = this.getServerData(guild);
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

exports.PFFilter = (Bot, msg, pFilter) => {
    return new Promise((resolve) => {
        // Profanity Check
        pFilter.censorString(msg.content)
        .then(value => { 
            if(value.CurseCount > 0){
                LOGSystem.LOG(JSON.stringify(value), LOGSystem.LEVEL.PROFANITY, 'censorString');
                
                this.embedMessage(Bot, msg, undefined, "Original Message Deleted", `${msg.author.tag}: \`\` ${value.NewString}.\`\``, "#ff0000", Bot.user.name, false);

                USERS = Bot.ServerData.USERS;
                SETTINGS = Bot.ServerData.SETTINGS;
                if(Bot.ServerData.SETTINGS.ProfanityFilterKickBan) {
                    msg.channel.send(`${msg.author}, Racism will not be tolerated in this server, repeated offences will result in a **BAN**.`)
                    
                    if(USERS[msg.author.id].Warnings >= SETTINGS.WarningsBeforeKick && USERS[msg.author.id].Warnings < SETTINGS.WarningsBeforeBan ){
                        this.embedMessage(Bot, msg, undefined, "Kicked User For Profanity", `Kicked ${msg.author} (${msg.author.id})`, "#ff6600", `Kicked by ${Bot.user.name}`, false)
                        msg.guild.members.fetch(msg.author.id)
                            .then(user => {
                                user.createDM()
                                    .then(dmChannel => { dmChannel.send(`${msg.author}, Racism will not be tolerated in this server, repeated offences will result in a **BAN**.`); });
                                user.kick();
                            });
                        USERS[msg.author.id].Warnings += 1
                    }else if(USERS[msg.author.id].Warnings >= SETTINGS.WarningsBeforeBan){
                        this.embedMessage(Bot, msg, undefined, "Banned User For Profanity", `Banned ${msg.author} (${msg.author.id})`, "#ff0000", `Banned by ${Bot.user.name}`, false)
                        msg.guild.members.fetch(msg.author.id)
                            .then(user => {
                                user.createDM()
                                    .then(dmChannel => { dmChannel.send(`${msg.author}, Racism will not be tolerated in this server. You have been **BANNED**.`); });
                                user.ban();
                            });
                        USERS[msg.author.id].Warnings += 1
                    }else USERS[msg.author.id].Warnings += 1
                }
                Bot.ServerData.USERS = USERS;
                Bot.ServerData.SETTINGS = SETTINGS;

                this.SetServerData(msg.guild.id, Bot.ServerData)

                msg.delete();
            }
        })
        .catch(err => { if(err) LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'censorString'); });
        resolve();
    });
}