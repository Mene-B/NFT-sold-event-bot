const {SlashCommandBuilder} = require("discord.js");
const {clientPG} = require("../database.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("subscribe")
    .setDescription("Subscribe to sold events, in a specific collection, in the channel of your choice")
    .addStringOption(option =>{
        return option
        .setName("keywords")
        .setDescription("Enter the key words of the collection you want to subscribe to")
        .setRequired(true)
    })
    .addChannelOption(option=>{
        return option
        .setName("channel")
        .setDescription("Choose the channel in which you want to receive notifications")
        .setRequired(true)
    })
    ,run: async(interaction)=>{
        const guildId = interaction.guild.id;
        const keyWords = interaction.options.getString("keywords");
        const channelId = interaction.options.getChannel("channel").id;
        await clientPG.query('insert into subscriptions values($1,$2,$3)',[guildId, keyWords, channelId]);
        interaction.reply({content: "Subscriptions registered", ephemeral: true})
    }
}