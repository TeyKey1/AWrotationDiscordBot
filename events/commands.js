const config = require("config");

const {addRotationChannel} = require("../guild/guildHandler");

async function command(msg, arguments){
    if(arguments[0] === "awr"){

        if(arguments[1] === "version"){
            getVersion(msg);
        }else 

        if(arguments[1] === "help"){
            getHelp(msg);
        }else 

        if(arguments[1] === "setup"){
             setupRotations(arguments, msg);
        }
        
        else{
            msg.channel.send(`Invalid command. For help please type **${config.get("options.prefix")}awr help**`);
        }
    }
}

function getVersion(msg){
    msg.channel.send(`**Software Version:** ${process.env.npm_package_version}\n**Developed By:** TeyKey1`);
}

function getHelp(msg){
    
}

async function setupRotations(arguments, msg){
    const channel = await msg.channel.guild.channels.resolve(arguments[2].substring(2, 20));
    const guild = msg.channel.guild;

    if(channel === null){
        await msg.channel.send("Invalid channel. Please specify a valid channel.");
        return;
    }

    addRotationChannel(guild, channel);
    
}

module.exports.command = command;