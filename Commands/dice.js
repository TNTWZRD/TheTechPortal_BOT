const Utilities = require('Utilities')
const Discord = require('discord.js')

module.exports = {
    name: 'dice',
    aliases: ['d', 'roll', 'shake'],
    description: 'Roll Dice',
    help: '!dice <DICE> (COUNT): Roll dice, D2-D5000, 1-200 Roll Count',
    usage: `<DICE> (COUNT)`,
    args: true,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            // Remove D From String
            args[0] = args[0].replace(/d/i, '');
            if(!parseInt(args[0])){
                msg.reply(`Dice unreadable, Range: D2-D5000`);
                return reject(`Dice out of range.`); }
            
            var DICE = parseInt(args[0]);

            if(DICE < 2 || DICE > 5000){
                msg.reply(`Dice Range: D2-D5000`);
                return reject(`Dice out of range.`); }
            
            var ROLLCOUNT = 1;
            if(args[1] && !parseInt(args[1])){
                msg.reply(`Numbers only for count, Roll Range: 1-200`);
                return reject(`Roll Count out of range.`); }
                
            if(parseInt(args[1]) < 1 || parseInt(args[1]) > 200){
                msg.reply(`Roll Range: 1-200`);
                return reject(`Roll Count out of range.`); }
            
            if(args[1]) ROLLCOUNT = parseInt(args[1]);

            var ROLLS = [];
            var MIN = 5000;
            var MAX = 0;
            var TOTAL = 0;

            
            // ROLL DICE
            for(i =0; i < ROLLCOUNT; i++){
                var value = Math.floor(Math.random() * (DICE+1));
                MIN = Math.min(MIN, value);
                MAX = Math.max(MAX, value);
                TOTAL += value;
                ROLLS.push(value); 
            }

            if(ROLLCOUNT == 1){
                var embedCode = new Discord.MessageEmbed({
                    "title": `Roll the Dice!! D${DICE}X${ROLLCOUNT}`,
                    "description": `**Rolled**: ${TOTAL}`,
                    "color": 6526,
                    "footer": {
                      "text": `Generated By ${Bot.user.username}`
                    },
                    "author": {
                      "name": `Roll for: ${msg.author.username}`
                    }
                  });    
            }else {
                var embedCode = new Discord.MessageEmbed({
                    "title": `Roll the Dice!! D${DICE}X${ROLLCOUNT}`,
                    "description": `**Total**: ${TOTAL}, **Average**: ${TOTAL/ROLLCOUNT},\n**Minimum**: ${MIN}, **Maximum**: ${MAX},\n \n**Actual Rolls**: \n [ ${Utilities.trim(ROLLS.join(', '), 1024)} ]`,
                    "color": 6526,
                    "footer": {
                        "text": `Generated By ${Bot.user.username}`
                    },
                    "author": {
                        "name": `Roll for: ${msg.author.username}`
                    }
                    });
            }

            msg.channel.send({ embed: embedCode })

            resolve(`!Dice Executed, No Errors`);
        });
	},
};