const {OpenSeaStreamClient} = require("@opensea/stream-js");

const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ]
});

const config = require("./config.json");

const {WebSocket} = require("ws");

const {clientPG} = require("./database.js");

const openSeaClient = new OpenSeaStreamClient({
    token: config.APIKey,
    connectOptions:{
        transport: WebSocket
    }
})
openSeaClient.connect();
openSeaClient.onItemSold("*",async (event)=>{
    const datas = (await clientPG.query("select * from subscriptions;")).rows;
    datas.forEach(async(data) =>{
        let subscribed = false;
        const keyWords = data.key_words.split(" ")
        keyWords.forEach((word) =>{
            if (event.payload.collection.slug.includes(word)){
                subscribed = true;
            }
        })
        if(subscribed === true){
            const takerAddress = event.payload.taker.address;
            const makerAddress = event.payload.maker.address;

            const takerName = (await (fetch("https://api.opensea.io/user/"+takerAddress, {
                method: 'GET',
                headers: {
                    "X-API-KEY":config.APIKey
                }
            }).then(result=>{
                return result.json()
            }))).username;

            const makerName = (await (fetch("https://api.opensea.io/user/"+makerAddress, {
                method: 'GET',
                headers: {
                    "X-API-KEY":config.APIKey
                }
            }).then(result=>{
                return result.json()
            }))).username;

            const nameNFT = event.payload.item.metadata.name;
            const NFTLink = event.payload.item.permalink;

            const price = (Math.round(+(event.payload.payment_token.eth_price) * 1000)/1000).toString() + " ETH";
            const dollarPrice = (Math.round(+(event.payload.payment_token.usd_price) * 1000)/1000).toString() + " $";

            const embed = new Discord.EmbedBuilder()
            .setTitle(`:white_check_mark: ${nameNFT} has been sold !`)
            .setURL(NFTLink)
            .setDescription(`:label: Price : **${price} || ${dollarPrice}**\n:bust_in_silhouette: Taker : **${takerName}**\n:identification_card: Maker : **${makerName}**`)
            .setColor("Blurple")
            .setTimestamp()
            .setFooter({text: "From OpenSea market place",iconURL: client.user.displayAvatarURL()})

            if(event.payload.item.metadata.image_url !== null){
                embed.setThumbnail(event.payload.item.metadata.image_url);
            }

            client.guilds.cache.get(data.guild_id).channels.cache.get(data.channel_id).send({embeds: [embed]});
        }
    })
    console.log(datas)
    console.log(event);
    console.log(event.payload.collection.slug);

    // il faut récup l'adresse du taker et retrouver son nom via le lien : https://api.opensea.io/user/ en mettant son adresse après le /, c'est une méthode GET, voir Postman, il y a encore la requête
    // Il faudra aussi mettre le perma link de la NFT dans le titre de l'embed 
});

client.login(config.token);

client.on("ready", ()=>{
    console.log("Bot ready !");
})

const commands = fs.readdirSync("./slash-commands").map(fileName =>{
    const command = require("./slash-commands/"+fileName);
    return {name: command.data.name, run: command.run}
})

client.on("interactionCreate", (interaction)=>{
    if(interaction.isCommand()){
        const command = commands.find(cmd=>{
            return cmd.name === interaction.commandName;
        })
        return command.run(interaction);
    }
})