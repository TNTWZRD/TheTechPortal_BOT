const Utilities = require('Utilities')
const Discord = require('discord.js')

module.exports = {
    name: 'dice',
    aliases: ['d', 'r', 'roll', 'shake'],
    description: 'Roll Dice',
    help: '!dice <COUNT>d<FACECOUNT>: Roll dice, D2-D5000, 1-200 Roll Count: 2ds6',
    usage: `<COUNT>d<FACECOUNT>`,
    args: true,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            // Remove D From String
            var dice = args[0].split('d');
            var dicePlus = dice[1].split('+');
            if(!parseInt(dicePlus[0])){
                msg.reply(`Dice unreadable, Range: D2-D5000`);
                return reject(`Dice out of range.`); }
            
            var DICE = parseInt(dicePlus[0]);
            var add = 0;
            if(dicePlus[1]){
                add = parseInt(dicePlus[1]);
            }

            if(DICE < 2 || DICE > 5000){
                msg.reply(`Dice Range: D2-D5000`);
                return reject(`Dice out of range.`); }
            
            var ROLLCOUNT = 1;
            if(args[1] && !parseInt(args[1])){
                msg.reply(`Numbers only for count, Roll Range: 1-200`);
                return reject(`Roll Count out of range.`); }
                
            if(parseInt(dice[0]) < 1 || parseInt(dice[0]) > 200){
                msg.reply(`Roll Range: 1-200`);
                return reject(`Roll Count out of range.`); }
            
            if(dice[0]) ROLLCOUNT = parseInt(dice[0]);

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
            
            data = [];
            data.push(`**SUM**: ${TOTAL}+${add} = ${(TOTAL+add)}\n`);
            ROLLS.forEach((element, index) => { data.push(`**Roll #${(index+1)}** : \n${element}`); });

            var embedCode = new Discord.MessageEmbed({
                "title": `${ROLLCOUNT}D${DICE} Rolls For (${msg.author.tag})`,
                "color": 6526,
                "footer": {
                    "text": `Generated By ${Bot.user.username}`
                }
                });
            embedCode.setDescription(data);

            msg.channel.send({ embed: embedCode })

            resolve(`!Dice Executed, No Errors`);
        });
	},
};