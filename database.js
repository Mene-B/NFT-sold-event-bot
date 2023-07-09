const {Client} = require("pg");

const client = new Client({
    database:"NFT's sold",
    password:"edouard2005",
    user:"postgres",
    host:"localhost",
    port:5432
});

client.connect();

module.exports.clientPG = client;
