const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const Discord = require('discord.js')

module.exports = {
    name: 'magicthegathering',
    aliases: ['mtg'],
    description: 'Lookup Magic The Gathering card',
    help: '!magicthegathering <CARDNAME>: Lookup Magic The Gathering card by card name',
    usage: `<CARDNAME>`,
    args: true,
    guildOnly: false,
    minPermissions: "GENERAL_USER",
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            var querry = querystring.stringify( { name: args.join(' ') } );
            var CARD = await fetch(`https://api.magicthegathering.io/v1/cards?${querry}`)
                .then(response => { if(response.ok) return response.json(); else return false; })
                .catch(console.error)

            if(!CARD){
                msg.reply(`Nothing found for [${args.join[' ']}], please search again using correct card name.`);
                return reject("Invalid Card Lookup"); }

            var data = [];
            var embed = new Discord.MessageEmbed();
            if(CARD) {
                CARD.cards.some(e =>{
                    if(e.multiverseid) {
                        CARD = e;
                        return true;
                    }
                });
                embed.setTitle(`Magic The Gathering Card: ${CARD.names[0]} : ${CARD.names[1]}\nMID: ${CARD.multiverseid}`);
                if(CARD.imageUrl) embed.setThumbnail(CARD.imageUrl);

                data.push(`**${CARD.colorIdentity.type}**: ${CARD.colors[0]} - ${CARD.rarity}`);
                data.push(`**Mana Cost**: ${CARD.mansCost}`);

                data.push(`\n**Description**: \n${CARD.text}`)

                data.push(`\n**${CARD.power}/${CARD.toughness}**\n`)

                data.push(`**Legalities**:`)
                CARD.legalities.forEach(e => {
                    data.push(` - **${e.format}** : ${e.legality}`);
                });

                data.push(`\n**Rulings**:`)
                CARD.rulings.forEach(e => {
                    data.push(` - **${e.date}** : ${e.text}`);
                });

                embed.setDescription(data)
            }
            embed.setFooter('Data provided by: magicthegathering.io');

            if(msg.guild) msg.channel.send(embed);
            else msg.reply(embed)

            resolve("!YuGiOh Executed, No Errors");
        });
	},
}; 