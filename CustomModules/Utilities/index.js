/*
    Written By Daniel Jajliardo @ TheTechSphere 2020
    Random Functions for my Discord.JS Bot
    Currently returns a priomise in order to make it Async
*/

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

    var options = str.match(/([-]+.)/g) // << Get Options
    if(options && options.length >= 1) options.forEach(i => { str = str.replace(i, ''); });

    RETURN = str.split(/"([^"]+)"|\s*([^"\s]+)/g)
    RETURN.forEach(element => {
        if(element && element != '' && element != ' ') newReturn.push(element)
    });
    RETURN = newReturn

    return {"ARGS":RETURN, "OPTIONS":options}
} // !stats; !ping
//!ping mod1; !@warn asshole3 

exports.splitCommands = (msg) => { return msg.split(';') }