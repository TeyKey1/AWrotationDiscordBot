const config = require("config");

const {createGuild, deleteGuild} = require("../guild/guildHandler");

function onMessage(msg){
    if(msg.content.substring(0, 1) === config.get("options.prefix")){
        const arguments = msg.content.substring(1).split(" ");

        arguments.forEach((e)=>{
            e.trim();
        });

        if(arguments[0] === "awr"){
            console.log("awr command");
        }
    }
};

function onGuildCreate(guild){
    createGuild(guild);
}

function onGuildDelete(guild){
    //Delete Messages of Bot

    deleteGuild(guild);
}

module.exports.onMessage = onMessage;
module.exports.onGuildCreate = onGuildCreate;
module.exports.onGuildDelete = onGuildDelete;