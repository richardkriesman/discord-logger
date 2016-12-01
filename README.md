# discord-logger
A bot for Discord that logs server actions (joining/leaving, bans, edits, and deletions)

### Installation

The following are required to run discord-logger:
 - Node.JS v6.9.1 or higher
 - A Discord bot user token (bot users can be created at https://discordapp.com/developers/applications/me)

Once you have those:
 - In server.js, set const TOKEN to the bot token you created.
 - Set const CHANNEL to the name of the Discord channel (not ID) that want discord-logger to log server actions to
 - In your terminal, run "npm install" to install the required dependencies

You can then run the bot with "node server.js"

### License
discord-logger is licensed under the MIT License.