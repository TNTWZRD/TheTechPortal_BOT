const Utilities = require('Utilities')
const fetch = require('node-fetch')
const querystring = require('querystring')
const Discord = require('discord.js')

module.exports = {
    name: 'weather',
    aliases: [],
    description: 'Get The Weather',
    help: '!Weather <LOATION>: Get The Weather, US Zipcode, UK Postcode, Canada Postalcode, IP address, Latitude/Longitude (decimal degree) or city name',
    usage: `<LOCATION>`,
    args: true,
    guildOnly: false,
	execute(Bot, msg, _args) {
        return new Promise(async (resolve, reject) => {
            const OPTIONS = _args.OPTIONS;
            const args = _args.ARGS;

            const URL = "http://api.weatherapi.com/v1/current.json?key=9fcdb42eb7d4451ca76232839201905&";

            const query = querystring.stringify( { 
                q:args.join(' ')
            });
            var Weather = await fetch(`${URL}${query}`)
                .then(response => response.json());

            const embedMsg = new Discord.MessageEmbed({
                title: `Current Weather In ${Weather.location.name} ${Weather.location.tz_id}`,
                description: `Current Temperature: ${Weather.current.temp_f} F/ ${Weather.current.temp_c} C - ${Weather.current.condition.text}\nWind: ${Weather.current.wind_dir} at ${Weather.current.wind_mph}mph - Pressure: ${Weather.current.pressure_in}in - Precipitation:  ${Weather.current.precip_in}in\nUV: ${Weather.current.uv} - Visibility: ${Weather.current.vis_miles}miles`,
                footer: {
                  text: `Last Updated: ${Weather.current.last_updated}, Info Provided By: weatherapi.com`,
                },
              })
              .setThumbnail(Weather.current.condition.icon.replace('//', 'https://'))

            msg.channel.send({embed: embedMsg});

            resolve("!Weather Executed, No Errors");
        });
	},
};