const {Client} = require("pg");

const client = new Client({
    database:"Name of your database",
    password:"XXXXXXXX",
    user:"postgres",
    host:"localhost",
    port:5432
});

client.connect();

module.exports.clientPG = client;
