const {SlashCommandBuilder} = require("discord.js");
const {clientPG} = require("../database.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("unsubscribe")
    .setDescription("Use this command to unsubscribe your server from the sold events that you entered"),
    run: async(interaction)=>{
        const guild = interaction.guild;
        await clientPG.query("delete from subscriptions where guild_id = $1",[guild.id]);
        interaction.reply({content:"You are now unsubscribed :thumbsup:", ephemeral: true})
    }
}