const Discord = require("discord.js");
const config = require("config");
const schedule = require("node-schedule");
const fs = require("fs");

const eventHandler = require("./events/eventHandler");
const {downloadRotation} = require("./utility/fetchRotation");
const {scheduleUpdateTasks} = require("./scheduler/rotationsSchedule");
const { loadGuilds } = require("./guild/guildHandler");
const {logger} = require("./utility/logger");

const bot = new Discord.Client({
    messageCacheMaxSize: 100, 
    messageCacheLifetime:	43200, 
    messageSweepInterval: 3600,
    messageEditHistoryMaxSize: 0,
    fetchAllMembers: false,
    retryLimit: 3
});

//Initialization & Login
bot.login(config.get("token")).catch(err =>{
    logger.error("Failed to login Bot on Discord:", err);
    process.exit(1);
});



bot.on("ready", async ()=>{
    bot.user.setPresence({
        status: "online", 
        activity: {
            name: "AW PVE rotations",
            type: "WATCHING",
        }
    });

    logger.info("Discord JS ready");

    await init();
});

//Events
bot.on("message", eventHandler.onMessage);
bot.on("guildCreate", eventHandler.onGuildCreate);
bot.on("guildDelete", eventHandler.onGuildDelete);
bot.on("messageDelete", eventHandler.onMessageDelete);

//Errors
process.on('unhandledRejection', err => {
	logger.error("Unhandled promise rejection:", err);
});

bot.on("error", err => {
    logger.error("Discord client error:", err);
});


async function init(){
    //check if data directory exists or create a new one
    try {
        if(!fs.existsSync("./data")){
            fs.mkdirSync("./data");
            logger.info("No data directory found, creating a new one.");
        }
    } catch (err) {
        logger.error("Failed to create a new data directory:", err);
        process.exit(1);
    }


    //Start webserver serving static files
    require("./server");
    
    try {
        loadGuilds();
    } catch (err) {
        logger.error("Failed to load guild data:", err);
        process.exit(1);
    }

    try{
        await downloadRotation();
    } catch (err) {
        logger.warn("Failed to download rotations on init:", err);
    }

    scheduleUpdateTasks(bot);

    scheduleRotationDownload();

}

function scheduleRotationDownload(){
    const rule = new schedule.RecurrenceRule();
    rule.minute = new schedule.Range(0, 59, config.get("options.rotationFetchInterval"));

    schedule.scheduleJob("Downolad Rotations", rule, async ()=>{
        try {
            await downloadRotation();
        } catch (err) {
            logger.warn(`Failed to download rotations. Try again in ${config.get("options.rotationFetchInterval")}.`, err);
        }
    });
}
