/*
    Written By Daniel Jajliardo @ TheTechSphere 2020
    Random Functions for my Discord.JS Bot
    Currently returns a promise in order to make it Async
*/

const Discord = require('discord.js');
const LOGSystem = require('LOGSystem')
var fs = require('fs');
var config = require(process.cwd() + '/config.json');
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
    console.log("Mysql Connected!!");
});

exports.GetServer = (ServerID, ServerName) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT * FROM \`Servers\` WHERE \`SUID\` = '${ServerID}'`;
        connection.query(query, (err, result) => {
            if(err) reject(err);
                if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0])));
                else{
                    var query = `INSERT INTO \`Servers\`(\`SUID\`, \`ServerName\`) VALUES ('${ServerID}','${ServerName}')`;
                    connection.query(query, function(err, result, fields){
                        if(err) reject(err);
                        var query = `SELECT * FROM \`Servers\` WHERE \`SUID\` = '${ServerID}'`;
                        connection.query(query, (err, result) => {
                            if(err) reject(err);
                                if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0])));
                        });
                    });
                }
            });
    });
};

exports.SetServerValue = (ServerID, Setting, Value) => {
    return new Promise((resolve, reject) => {
        var query = `UPDATE \`Servers\` SET \`${Setting}\`='${Value}' WHERE \`SUID\` = '${ServerID}'`;
        connection.query(query, (err, result) => {
            if(err) reject(err);
            var query = `SELECT * FROM \`Servers\` WHERE \`SUID\` = '${ServerID}'`;
            connection.query(query, (err, result) => {
                if(err) reject(err);
                    if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0])));
            });
        });
    });
}

exports.GetUser = (ServerID, UserID, UserName = null, IsOwner = 0) => {
    return new Promise((resolve, reject) => {
        //console.log(UserName);
        var query = `SELECT * FROM \`Users\` WHERE \`SUID\` = '${ServerID}' AND \`UID\` = '${UserID}'`;
        connection.query(query, (err, result) => {
            if(err) reject(err);
                if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0])));
                else{
                    var query = `INSERT INTO \`Users\`(\`SUID\`, \`UID\`, \`Username\`, \`PermissionsLevel\`) VALUES ('${ServerID}', '${UserID}', '${UserName}', '${IsOwner}')`;
                    connection.query(query, function(err, result, fields){
                        if(err) reject(err);
                        LOGSystem.LOG(`Added User: ${UserName}`, undefined, "GetUser");
                        var query = `SELECT * FROM \`Users\` WHERE \`SUID\` = '${ServerID}' AND \`UID\` = '${UserID}'`;
                        connection.query(query, (err, result) => {
                            if(err) reject(err);
                                var newResult = JSON.parse(JSON.stringify(result[0]));
                                newResult.UserName = decodeURI(newResult.UserName)
                                if(result.length > 0) return resolve(newResult);
                                reject("Error");
                            });
                    });
                }
            });
    });
}

exports.SetUserValue = (ServerID, UserID, Setting, Value) => {
    return new Promise((resolve, reject) => {
        var query = `UPDATE \`Users\` SET \`${Setting}\`='${Value}' WHERE \`SUID\` = '${ServerID}' AND \`UID\` = '${UserID}'`;
        connection.query(query, (err, result) => {
            if(err) reject(err);
            var query = `SELECT * FROM \`Users\` WHERE \`SUID\` = '${ServerID}' AND \`UID\` = '${UserID}'`;
            connection.query(query, (err, result) => {
                if(err) reject(err);
                    if(result.length > 0) return resolve(JSON.parse(JSON.stringify(result[0])));
                    reject("Error");
                });
        });
    });
}

exports.trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);

exports.hasPermissions = async (Bot, UserID, LEVEL) => { 
    var perm = await this.GetUser(Bot.SETTINGS.SUID, UserID);
    console.log(`SUID = ${Bot.SETTINGS.SUID} AND UID = ${UserID}`)
    console.log(perm.PermissionsLevel + " == " + LEVEL + " <<-- ");
    console.log((perm.PermissionsLevel & Bot.PERMS[LEVEL]) == Bot.PERMS[LEVEL]);
    return ((perm.PermissionsLevel & Bot.PERMS[LEVEL]) == Bot.PERMS[LEVEL]); 
}

exports.addUsers = (Bot, msg) => {
    return new Promise(async resolve => {
        msg.mentions.members.forEach(async e => { 
            var owner = 0;
            if(e.user.id == msg.guild.ownerID) owner = 15;
            await this.GetUser(Bot.SETTINGS.SUID, e.user.id, e.user.username+"#"+e.user.discriminator , owner); 
        });
        var owner = 0;
        if(msg.author.id == msg.guild.ownerID) owner = 15;
        await this.GetUser(Bot.SETTINGS.SUID, msg.author.id, msg.author.tag, owner).then(e=> {resolve('');})
    });
};

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
                
                if(Bot.SETTINGS.ProfanityFilterKickBan) {
                    msg.channel.send(`${msg.author}, Racism will not be tolerated in this server, repeated offences will result in a **BAN**.`)
                    
                    if(Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id).Warnings >= Bot.SETTINGS.WarningsBeforeKick && Utilities.GetUser(Bot.SETTINGS.SUID, mg.author.id).Warnings < Bot.SETTINGS.WarningsBeforeBan ){
                        this.embedMessage(Bot, msg, undefined, "Kicked User For Profanity", `Kicked ${msg.author} (${msg.author.id})`, "#ff6600", `Kicked by ${Bot.user.name}`, false)
                        msg.guild.members.fetch(msg.author.id)
                            .then(user => {
                                user.createDM()
                                    .then(dmChannel => { dmChannel.send(`${msg.author}, Racism will not be tolerated in this server, repeated offences will result in a **BAN**.`); });
                                user.kick();
                            });
                            // Increment
                            Utilities.SetUserValue(Bot.SETTINGS.SUID, msg.author.id, "Warnings", (Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id).Warnings+1));
                    }else if(Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id).Warnings >= Bot.SETTINGS.WarningsBeforeBan){
                        this.embedMessage(Bot, msg, undefined, "Banned User For Profanity", `Banned ${msg.author} (${msg.author.id})`, "#ff0000", `Banned by ${Bot.user.name}`, false)
                        msg.guild.members.fetch(msg.author.id)
                            .then(user => {
                                user.createDM()
                                    .then(dmChannel => { dmChannel.send(`${msg.author}, Racism will not be tolerated in this server. You have been **BANNED**.`); });
                                user.ban();
                            });
                            // Increment Warnings
                            Utilities.SetUserValue(Bot.SETTINGS.SUID, msg.author.id, "Warnings", (Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id).Warnings+1));
                    }else Utilities.SetUserValue(Bot.SETTINGS.SUID, msg.author.id, "Warnings", (Utilities.GetUser(Bot.SETTINGS.SUID, msg.author.id).Warnings+1));
                }

                msg.delete();
            }
        })
        .catch(err => { if(err) LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'censorString'); });
        resolve();
    });
}

exports.getFile = (FILE) => {
    var toReturn = null;
    if(fs.existsSync(FILE)){
        toReturn = fs.readFileSync(FILE, 'utf8', function(err, contents){
            if(!err) {
                return contents;
            }else {
                LOGSystem.LOG(err, LOGSystem.LEVEL.ERROR, 'getFile');
                return false;
            }
        });
    }else{
        toReturn = false;
    }
    return toReturn;
}

exports.randomString = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

exports.escapeRegex = (string) => {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

exports.shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

exports.camelCaseWord = (str) => {
    str = str.split(''); 
    str[0] = str[0].toLocaleUpperCase(); 
    str = str.join('');
    return str;
}