# AWrotationDiscordBot
A discord bot which shows the active PVE rotations in AW.

This Project is best used in combination with the online [Armored Warfare PVE Rotation Tracker](https://github.com/GoldenGnu/armored-warfare-pve-tracker) by GoldenGnu. But can also be used standalone. You can host your own Discord Bot or simply use the provided one.

### Invite the provided Discord Bot to your Discord Server
This is probably the best and simplest solution for most usecases. Simply click this link and invite the bot to your server: 

To setup a rotation message use the provided Discord Commands

### Discord Commands
You can use the following commands in Discord to control the bot:

**$help** shows the help page of this bot with all available commands

**$setup *#channel*** creates a PVE rotation in the given channel

**$delete *#channel*** deletes a PVE rotation in the given channel

**$version** shows the version of the bot and other details

### Host the bot on your own
You can also host the bot on your own. It's a node JS program and can be easily deployed to most common hosters. In this usecase you'll usually also want to host the online Armored Warfare PVE Rotation Tracker to provide and edit the rotation data. You can configure the bot in the config directory with the *production.json* file.

The bot relies on json rotation data which needs to be provided online by using the online Armored Warfare PVE Rotation Tracker for example. 

### Issues and suggestions
In case you encounter bugs or other issues do not hesitate to create an issue on github. I'll try to fix it asap.

I'm also open to any suggestions you might have or features you'd like to have implemented. Please let me know!
