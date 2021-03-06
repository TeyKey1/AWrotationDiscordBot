const schedule = require("node-schedule");
const Discord = require("discord.js");
const config = require("config");
const {DateTime, Duration} = require("luxon");
const fs = require("fs");
const {logger} = require("../utility/logger");

const { getGuilds } = require("../guild/guildHandler");
const {getOffset, generateImage, getUrlId} = require("../rotation");

var updateRotationImagesTask;
var updateRotationMessagesTask;
var ruleImage;
var ruleMessage;

function scheduleUpdateTasks(bot) {
    ruleImage = new schedule.RecurrenceRule();
    ruleImage.minute = new schedule.Range(0, 59, 3);
    ruleImage.second = 0;

    //update rotation images
    updateRotationImagesTask = schedule.scheduleJob("update rotation images", ruleImage, async () => {
        try {
            updateRotationImages(bot);
        } catch (err) {
            logger.warn("Failed to update rotation images:", err);
        }
    });

    ruleMessage = new schedule.RecurrenceRule();
    ruleMessage.second = new schedule.Range(0, 59, 10);

    updateRotationMessagesTask = schedule.scheduleJob("update rotation messages", ruleMessage, async () => {
        try {
            updateRotationMessages(bot);
        } catch (err) {
            logger.warn("Failed to update rotation messages:", err);
        }
    });
}

function updateSchedule() {
    const offset = getOffset();

    ruleImage.minute = new schedule.Range(DateTime.fromObject({minute: 0, seconds: 0}).plus(offset).minute % 3, 60, 3);
    ruleImage.second = DateTime.fromObject({second: 0}).plus({seconds: offset.seconds}).second;

    updateRotationImagesTask.reschedule(ruleImage);

    ruleMessage.second = new schedule.Range(offset.seconds % 10, 59, 10);

    updateRotationMessagesTask.reschedule(ruleMessage);

}

async function updateRotationImages(bot) {
    
    try {
        await generateImage();
    } catch (err) {
        logger.error("Failed to generate rotation image:", err);
    }

    const {urlID, prevUrlID} = getUrlId();

    getGuilds().forEach(async (value, key) => {
        try {

            const guild = await bot.guilds.fetch(value.guildId);

            value.rotationChannelData.forEach(async (e) => {
                try {
                    const channel = guild.channels.resolve(e.channelId);

                    const rotationImage = await channel.messages.fetch(e.rotationImageId);
    
                    //update
                    rotationImage.edit(`${config.get("server.baseUrl")}:${config.get("server.port")}/data/rotations${urlID}.png`);
                } catch (err) {
                    logger.warn(`Failed to update rotation image message ID ${e.rotationImageId} in guild ID ${value.guildId}:`, err);
                }
            });

        } catch (err) {
            logger.warn(`Failed to fetch guild with ID ${value.guildId}:`, err);
        }
    });

    //Delete old image
    fs.unlink(`./data/public/rotations${prevUrlID}.png`, (err) => {

    });
}

async function updateRotationMessages(bot) {

    var difference = DateTime.fromISO(updateRotationImagesTask.nextInvocation().toISOString()).diffNow();

    if(difference <= Duration.fromObject({minutes: 0, seconds: 0})){
        difference = Duration.fromObject({minutes: 3, seconds: 0});
    }

    getGuilds().forEach(async (value, key) => {
        try {

            const guild = await bot.guilds.fetch(value.guildId);

            value.rotationChannelData.forEach(async (e) => {
                try {
                    const channel = guild.channels.resolve(e.channelId);

                    const rotationMessage = await channel.messages.fetch(e.rotationMessageId);

                    //update
                    const embed = new Discord.MessageEmbed()
                        .setColor("#FCA311")
                        .setTitle("PVE Rotations")
                        .setDescription(`Next maps in: ${difference.toFormat("mm:ss")} min \n\nAW rotations by ${config.get("options.rotationSourceUrl")}`);

                    rotationMessage.edit("", embed);
                } catch (err) {
                    logger.warn(`Failed to update rotation message message ID ${e.rotationMessageId} in guild ID ${value.guildId}:`, err);
                }
            });

        } catch (err) {
            logger.warn(`Failed to fetch guild with ID ${value.guildId}:`, err);
        }
    });
}

module.exports.scheduleUpdateTasks = scheduleUpdateTasks;
module.exports.updateSchedule = updateSchedule;