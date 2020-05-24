const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const Discord = require('discord.js')

module.exports = {
    name: 'yugioh',
    aliases: [],
    description: 'Lookup Yu-Gi-Oh card',
    help: '!yugioh <CARDNAME>: Lookup Yu-Gi-Oh card by card name',
    usage: `<CARDNAME>`,
    args: true,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            var querry = querystring.stringify( { name: args.join(' ') } );
            var CARD = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?${querry}`)
                .then(response => { console.log(response); if(response.ok) return response.json(); else return false; })
                .catch(console.error)

            if(!CARD){
                var querry = querystring.stringify( { fname: args.join(' ') } );
                CARD = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?${querry}`)
                    .then(response => { console.log(response); if(response.ok) return response.json(); else return false; })
                    .catch(console.error)
            }

            if(!CARD){
                msg.reply(`Nothing found for [${args.join[' ']}], please search again using correct card name.`);
                return reject("Invalid Card Lookup"); }

            var data = [];
            var embed = new Discord.MessageEmbed();
            if(CARD) {
                CARD = CARD.data[0];
                console.log(JSON.stringify(CARD, null, `\t`))
                embed.setTitle(`Yu-Gi-Oh Card: ${CARD.name}`);
                embed.setThumbnail(`https://storage.googleapis.com/ygoprodeck.com/pics/${CARD.id}.jpg`);

                data.push(`**${CARD.type}**: ${CARD.race}`)
                if(CARD.atk != undefined){
                    data.push(`**ATK/** ${CARD.atk} **DEF/** ${CARD.def}`)
                    data.push(`**Level**: ${CARD.level}, **Attribute**: ${CARD.attribute}`)
                }

                data.push(`${CARD.desc}`)

                embed.setDescription(data)
            }
            embed.setFooter('Data provided by: db.ygoprodeck.com');

            if(msg.guild) msg.channel.send(embed);
            else msg.reply(embed)

            resolve("!YuGiOh Executed, No Errors");
        });
	},
}; 