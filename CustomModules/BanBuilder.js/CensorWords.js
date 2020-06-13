var badwords = [];
var censorChecks = null;
var whiteList = [];
var fs = require('fs');
var externalWords = false;
var externaWordsList = [];

var files = {
    "ALL" : __dirname + "/Resources/BanWords_All.json",
    "RACIST" : __dirname + "/Resources/RacistWordList.json"
}

exports.importBadWords = (NewBadwords) => {
    if(NewBadwords.length <= 0){
        return false; }
    externalWords = true;
    externalWordsList = NewBadwords;
    return true;
}

exports.filterType = (All, fullWords = true) => {
    if(All){
        var tmp = fs.readFileSync(files.ALL, 'utf-8', function(err, contents){
            if(!err) {
                return contents;
            }else {
                console.log(err);
                return false; }
        });
        badwords = JSON.parse(tmp).WORDS
        if(badwords) {
            generateCensorChecks(fullWords)
            return true
        }
    } else { // Custom Words
        if(!externalWords){
            var tmp = fs.readFileSync(files.RACIST, 'utf-8', function(err, contents){
                if(!err) {
                    return contents;
                }else {
                    console.log(err);
                    return false; }
            });
            badwords = JSON.parse(tmp).WORDS
            if(badwords) {
                generateCensorChecks(fullWords)
                return true
        }}
        else{ // Use External Words
            badwords = externalWordsList;
            if(badwords){
                generateCensorChecks(fullWords)
                return true; }
        }
    }
}

function generateCensorChecks(fullWords = false){

    leet_replace = [];
    leet_replace['a'] = new RegExp(/(a|a\.|a\-|4|@|Á|á|À|Â|à|Â|â|Ä|ä|Ã|ã|Å|å|α|Δ|Λ|λ)(-|_|\s|\.)?/).source;
    leet_replace['b'] = new RegExp(/(b|b\.|b\-|8|\|3|ß|Β|β)(-|_|\s|\.)?/).source;
    leet_replace['c'] = new RegExp(/(c|c\.|c\-|Ç|ç|¢|€|<|\(|\{|©)(-|_|\s|\.)?/).source;
    leet_replace['d'] = new RegExp(/(d|d\.|d\-|&part;|\|\)|Þ|þ|Ð|ð)(-|_|\s|\.)?/).source;
    leet_replace['e'] = new RegExp(/(e|e\.|e\-|3|€|È|è|É|é|Ê|ê|∑)(-|_|\s|\.)?/).source;
    leet_replace['f'] = new RegExp(/(f|f\.|f\-|ƒ)(-|_|\s|\.)?/).source;
    leet_replace['g'] = new RegExp(/(g|g\.|g\-|6|9)(-|_|\s|\.)?/).source;
    leet_replace['h'] = new RegExp(/(h|h\.|h\-|Η)(-|_|\s|\.)?/).source;
    leet_replace['i'] = new RegExp(/(i|i\.|i\-|!|\||\]\[|]|1|∫|Ì|Í|Î|Ï|ì|í|î|ï)(-|_|\s|\.)?/).source;
    leet_replace['j'] = new RegExp(/(j|j\.|j\-)(-|_|\s|\.)?/).source;
    leet_replace['k'] = new RegExp(/(k|k\.|k\-|Κ|κ)(-|_|\s|\.)?/).source;
    leet_replace['l'] = new RegExp(/(l|1\.|l\-|!|\||\]\[|]|£|∫|Ì|Í|Î|Ï)(-|_|\s|\.)?/).source;
    leet_replace['m'] = new RegExp(/(m|m\.|m\-)(-|_|\s|\.)?/).source;
    leet_replace['n'] = new RegExp(/(n|n\.|n\-|η|Ν|Π)(-|_|\s|\.)?/).source;
    leet_replace['o'] = new RegExp(/(o|o\.|o\-|0|Ο|ο|Φ|¤|°|ø)(-|_|\s|\.)?/).source;
    leet_replace['p'] = new RegExp(/(p|p\.|p\-|ρ|Ρ|¶|þ)(-|_|\s|\.)?/).source;
    leet_replace['q'] = new RegExp(/(q|q\.|q\-)(-|_|\s|\.)?/).source;
    leet_replace['r'] = new RegExp(/(r|r\.|r\-|®)(-|_|\s|\.)?/).source;
    leet_replace['s'] = new RegExp(/(s|s\.|s\-|5|\|§)(-|_|\s|\.)?/).source;
    leet_replace['t'] = new RegExp(/(t|t\.|t\-|Τ|τ|7)(-|_|\s|\.)?/).source;
    leet_replace['u'] = new RegExp(/(u|u\.|u\-|υ|µ)(-|_|\s|\.)?/).source;
    leet_replace['v'] = new RegExp(/(v|v\.|v\-|υ|ν)(-|_|\s|\.)?/).source;
    leet_replace['w'] = new RegExp(/(w|w\.|w\-|ω|ψ|Ψ)(-|_|\s|\.)?/).source;
    leet_replace['x'] = new RegExp(/(x|x\.|x\-|Χ|χ)(-|_|\s|\.)?/).source;
    leet_replace['y'] = new RegExp(/(y|y\.|y\-|¥|γ|ÿ|ý|Ÿ|Ý)(-|_|\s|\.)?/).source;
    leet_replace['z'] = new RegExp(/(z|z\.|z\-|Ζ)(-|_|\s|\.)?/).source;

    censorChecks = [];
    for (x = 0; x < badwords.length; x++){
        keys = [leet_replace.keys()];
        tmpCensor = badwords[x].split(''); //< Array Or Chars
        for(i = 0; i < tmpCensor.length; i++){
            if(leet_replace.findIndex(i => i === tmpCensor[i])){
                tmpCensor[i] = tmpCensor[i].replace(tmpCensor[i], leet_replace[tmpCensor[i]]);
            }
            else tmpCensor[i] = '';
            if(typeof tmpCensor[i] === 'undefined') tmpCensor[i] = '';
            if(tmpCensor[i] == 'undefined') tmpCensor[i] = '';
        }
        tmp = tmpCensor.join('');
        tmp = tmp.replace(/(undefined)/gi, '')
        tmpRegExp = tmpCensor.join('')
        if(fullWords){
            censorChecks[x] = new RegExp(/\b/.source + tmpRegExp + /\b/.source, 'i');
        }else{
            censorChecks[x] = new RegExp(tmpRegExp, 'i');
        }
    }
    // So longer words first!
    censorChecks.reverse();
}

exports.censorString = (string) => {
    return new Promise((resolve, reject) => {
        if(!censorChecks) reject("Run filterType first!");

        counter = 0;
        match = [];
        newString = [];
        newString['orig'] = unescape(string);
        original = newString.orig;

        chars = "!@#$%&*?".split('')

        censorChecks.forEach(element => {
            original = original.replace(element, function(word){ 
                counter++; 
                var newWord = "";
                for (i = 0; i < word.length; i++){ newWord += chars[Math.floor(Math.random() * chars.length)]}
                return newWord; 
            });
        });
        resolve( value={"OriString": string, "NewString":original, "CurseCount":counter} );
    });
    
}