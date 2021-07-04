const Utilities = require('Utilities')
const Discord = require('discord.js')
const Config = require(process.cwd() + '/config.json')

module.exports = {
    name: 'fizzbuzz',
    aliases: ['fiz'],
    description: 'Count in FizzBuzz Upto a Certain Number',
    help: '!fizzbuzz <NUMBER>: Count in FizzBuzz Upto NUMBER',
    usage: `<NUMBER>`,
    args: true,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
    module: Config.MODULES.FUN,
	execute(Bot, msg, _args) {
        return new Promise((resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            var countTo = args[0]
            if(!parseInt(countTo)){
                msg.reply(`Not A Valid NUMBER`);
                return reject(`Invalid INT`); 
            }
            
            data = [];

            data.push('\`\`\`\n')
            
            var txt = "";
            for( i=1; i<=countTo; i++){
                if(i % 3 == 0 && i % 5 == 0) txt += `FizzBuzz, `;
                else if(i % 3 == 0) txt += `Fizz, `;
                else if(i % 5 == 0) txt += `Buzz, `;
                else txt += `${i}, `;

                if(i%10==0) {
                    data.push(txt) 
                    txt = ''
                }
            }

            data.push(`${txt}\`\`\`\n`)
            
            var embedCode = new Discord.MessageEmbed({
                "title": `Counting to ${countTo}, In FizzBuzz`,
                "color": 6526,
                "footer": {
                    "text": `Generated By ${Bot.user.username}`
                }
                });
            embedCode.setDescription(data);

            msg.channel.send({ embed: embedCode })

            resolve(`!FizzBuzz Executed, No Errors`);
        });
	},
};