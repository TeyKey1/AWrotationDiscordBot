const fs = require("fs");
const config = require("config");
const fetch = require("node-fetch");
const streamToString = require("stream-to-string");
const  {DateTime} = require("luxon");

const {setRotationDate, getRotationDate, setRotations, setOffset} = require("../rotation");
const {updateSchedule} = require("../scheduler/rotationsSchedule");

const rotationFilePath = "./data/public";
var eTag = "";

async function downloadRotation(){
    const res = await fetch(config.get("options.rotationURL"), {
        method: 'GET',
        headers: {  
            "Content-Type": "application/json",
            "If-None-Match": eTag
         },
        body: null
    });

    eTag = res.headers.get("ETag");

    //Data up to date
    if(res.status === 304){
        return;
    }

    const string = await streamToString(res.body);

    const {data} = JSON.parse(string);

    const date = DateTime.fromFormat(data.date, "yyyy-MM-dd hh:mm");
    
    //Data up to date
    if(getRotationDate().equals(date)){
        return;
    }

    setRotationDate(date);

    //Save rotation to file
    if(!fs.existsSync(rotationFilePath)){
        fs.mkdirSync(rotationFilePath);
    }

    fs.writeFile(rotationFilePath + "/rotation.json", JSON.stringify(data), (err)=>{
        if(err){
            throw new Error("Failed to save rotation file: " + err);
        }

        updateRotation();  
        updateSchedule();
    }); 
}

function updateRotation(){
    fs.readFile(rotationFilePath + "/rotation.json", "utf-8", (err, data)=>{
        if(err){
            throw new Error("Failed to read rotation file: " + err);
        }

        const rotation = JSON.parse(data);
      
        setRotations(rotation.missions);

        setOffset(rotation.minutesOffset, rotation.secondsOffset);
    });
}

module.exports.downloadRotation = downloadRotation;