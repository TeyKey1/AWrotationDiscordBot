const config = require("config");

function onMessage(msg){
    if(msg.content.substring(0, 1) === config.get("options.prefix")){
        console.log("command entered");
    }
};

module.exports.onMessage = onMessage;