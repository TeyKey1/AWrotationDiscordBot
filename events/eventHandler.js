const config = require("config");

const {createGuild, deleteGuild} = require("../guild/guildHandler");
const {command} = require("./commands");

function onMessage(msg){
    if(msg.content.substring(0, 1) === config.get("options.prefix")){

        const arguments = msg.content.substring(1).toLowerCase().replace(/\s\s+/g, " ").split(" ");
        
        command(msg, arguments);
    }
};

function onGuildCreate(guild){
    createGuild(guild);
}

function onGuildDelete(guild){
    //Delete Messages of Bot

    console.log("Kick");
    deleteGuild(guild);
}

module.exports.onMessage = onMessage;
module.exports.onGuildCreate = onGuildCreate;
module.exports.onGuildDelete = onGuildDelete;