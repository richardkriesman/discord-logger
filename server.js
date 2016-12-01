/*
    Logger v0.1.0
    A bot for Discord that logs moderator actions.
    -----------------------------------------------
    Copyright © Richard Kriesman 2016.
*/

//imports
const Discord = require('discord.js');

//constants
const VERSION = '0.1.1';
const TOKEN = 'TOKEN GOES HERE';
const CHANNEL = 'log';

//declarations
var bot = new Discord.Client();

//
// Event Handlers
//

//bot is ready to start working, print status update to console
bot.on('ready', function() {
    console.log('[META][INFO] Connected to Discord API Service');
});

//bot disconnected from Discord
bot.on('disconnected', function() {
    console.log('[META][WARN] Disconnected from Discord API Service. Attempting to reconnected...');
});

//warning from Discord.js
bot.on('warn', function(msg) {
    console.log('[META][WARN] ' + msg);
});

//error from Discord.js
bot.on('error', function(err) {
    console.log('[META][ERROR] ' + err.message);
    process.exit(1);
});

//message received
bot.on('message', function(message) {
    if(message.author.id != bot.user.id) {
        if (message.channel.type == 'text')
            console.log('[' + message.guild.name + '][#' + message.channel.name + '][MSG] ' + message.author.username +
                '#' + message.author.discriminator + ': ' + formatConsoleMessage(message));
        else if (message.channel.type == 'dm')
            message.channel.sendMessage('Beep boop! Sorry, I can\'t respond to direct messages. Try inviting me to your ' +
                'server!\nhttps://discordapp.com/oauth2/authorize?&client_id=240256235952144395&scope=bot&permissions=8');
        else if (message.channel.type == 'group')
            message.channel.sendMessage('Beep boop! Sorry, I can\'t log group messages. Try inviting me to your server!\n' +
                'https://discordapp.com/oauth2/authorize?&client_id=240256235952144395&scope=bot&permissions=8');
    }
});

//message deleted
bot.on('messageDelete', function(message) {

    if(message.channel.type == 'text') {

        //log to console
        console.log('[' + message.guild.name + '][#' + message.channel.name + '][DELMSG] ' + message.author.username +
            '#' + message.author.discriminator + ': ' + formatConsoleMessage(message));

        //post in the guild's log channel
        var log = message.guild.channels.find('name', CHANNEL);
        if (log != null)
            log.sendMessage('**[Message Deleted]** ' + message.author + ': ' + message.cleanContent);

    }

});

//message update
bot.on('messageUpdate', function(oldMessage, newMessage) {

    if (newMessage.channel.type == 'text' && newMessage.cleanContent != oldMessage.cleanContent) {

        //log to console
        console.log('[' + newMessage.guild.name + '][#' + newMessage.channel.name + '][UPDMSG] ' +
            newMessage.author.username + '#' + newMessage.author.discriminator + ':\n\tOLDMSG: ' +
            formatConsoleMessage(oldMessage) + '\n\tNEWMSG: ' + formatConsoleMessage(newMessage));

        //post in the guild's log channel
        var log = newMessage.guild.channels.find('name', CHANNEL);
        if (log != null)
            log.sendMessage('**[Message Updated]** *' + newMessage.author + '*:\n*Old Message*: ' + oldMessage.cleanContent +
                '\n*New Message*: ' + newMessage.cleanContent);
    }

});

//user has been banned
bot.on('guildBanAdd', function(guild, user) {

    //log to console
    console.log('[' + guild.name + '][BAN] ' + user.username + '#' + user.discriminator);

    //post in the guild's log channel
    var log = guild.channels.find('name', CHANNEL);
    if (log != null)
        log.sendMessage('**[Banned]** ' + user);

});

//user has been unbanned
bot.on('guildBanRemove', function(guild, user) {

    //log to console
    console.log('[' + guild.name + '][UNBAN] ' + user.username + '#' + user.discriminator);

    //post in the guild's log channel
    var log = guild.channels.find('name', CHANNEL);
    if (log != null)
        log.sendMessage('**[Unbanned]** ' + user);

});

//user has joined a guild
bot.on('guildMemberAdd', function(guild, user) {

    //log to console
    console.log('[' + guild.name + '][JOIN] ' + user.username + '#' + user.discriminator);

    //post in the guild's log channel
    var log = guild.channels.find('name', CHANNEL);
    if (log != null) {
        log.sendMessage('**[Joined]** ' + user);
    }

});

//user has joined a guild
bot.on('guildMemberRemove', function(guild, user) {

    //log to console
    console.log('[' + guild.name + '][LEAVE] ' + user.username + '#' + user.discriminator);

    //post in the guild's log channel
    var log = guild.channels.find('name', CHANNEL);
    if (log != null)
        log.sendMessage('**[Left]** ' + user);

});

//user in a guild has been updated
bot.on('guildMemberUpdate', function(guild, oldMember, newMember) {

    //declare changes
    var Changes = {
        unknown: 0,
        addedRole: 1,
        removedRole: 2,
        username: 3,
        nickname: 4,
        avatar: 5
    };
    var change = Changes.unknown;

    //check if roles were removed
    var removedRole = '';
    oldMember.roles.every(function(value) {
        if(newMember.roles.find('id', value.id) == null) {
            change = Changes.removedRole;
            removedRole = value.name;
        }
    });

    //check if roles were added
    var addedRole = '';
    newMember.roles.every(function(value) {
        if(oldMember.roles.find('id', value.id) == null) {
            change = Changes.addedRole;
            addedRole = value.name;
        }
    });

    //check if username changed
    if(newMember.user.username != oldMember.user.username)
        change = Changes.username;

    //check if nickname changed
    if(newMember.nickname != oldMember.nickname)
        change = Changes.nickname;

    //check if avatar changed
    if(newMember.user.avatarURL != oldMember.user.avatarURL)
        change = Changes.avatar;

    //log to console
    switch(change) {
        case Changes.unknown:
            console.log('[' + guild.name + '][UPDUSR] ' + newMember.user.username + '#' + newMember.user.discriminator);
            break;
        case Changes.addedRole:
            console.log('[' + guild.name + '][ADDROLE] ' + newMember.user.username +'#' +  newMember.user.discriminator +
                ': ' + addedRole);
            break;
        case Changes.removedRole:
            console.log('[' + guild.name + '][REMROLE] ' + newMember.user.username + '#' + newMember.user.discriminator +
                ': ' + removedRole);
            break;
        case Changes.username:
            console.log('[' + guild.name + '][UPDUSRNM] ' + oldMember.user.username + '#' + oldMember.user.discriminator +
                ' is now ' + newMember.user.username + '#' + newMember.user.discriminator);
            break;
        case Changes.nickname:
            console.log('[' + guild.name + '][UPDUSRNK] ' + newMember.user.username + '#' + newMember.user.discriminator +
                (oldMember.nickname != null ? ' (' + oldMember.nickname + ')' : '') +
                (newMember.nickname != null ? ' is now ' + newMember.nickname : ' no longer has a nickname.'));
            break;
        case Changes.avatar:
            console.log('[' + guild.name + '][UPDAVT] ' + newMember.user.username + '#' + newMember.user.discriminator);
            break;
    }


    //post in the guild's log channel
    var log = guild.channels.find('name', CHANNEL);
    if (log != null) {
        switch(change) {
            case Changes.unknown:
                log.sendMessage('**[User Update]** ' + newMember);
                break;
            case Changes.addedRole:
                log.sendMessage('**[User Role Added]** ' + newMember + ': ' + addedRole);
                break;
            case Changes.removedRole:
                log.sendMessage('**[User Role Removed]** ' + newMember + ': ' + removedRole);
                break;
            case Changes.username:
                log.sendMessage('**[User Username Changed]** ' + newMember + ': Username changed from ' +
                    oldMember.user.username + '#' + oldMember.user.discriminator + ' to ' +
                    newMember.user.username + '#' + newMember.user.discriminator);
                break;
            case Changes.nickname:
                log.sendMessage('**[User Nickname Changed]** ' + newMember + ': ' +
                    (oldMember.nickname != null ? 'Changed nickname from ' + oldMember.nickname +
                        + newMember.nickname : 'Set nickname') + ' to ' +
                    (newMember.nickname != null ? newMember.nickname + '.' : 'original username.'));
                break;
            case Changes.avatar:
                log.sendMessage('**[User Avatar Changed]** ' + newMember);
                break;
        }
    }

});

//
// Startup Sequence
//
console.log('Logger v' + VERSION);
console.log('A bot for Discord that logs moderator actions.\n');
console.log('Copyright © Richard Kriesman 2016. Released under the MIT license.');
console.log('----------------------------------------------');

console.log('[META][INFO] Started Logger v' + VERSION);

bot.login(TOKEN); //log in to discord

function formatConsoleMessage(message) {
    return message.cleanContent.replace(new RegExp('\n', 'g'), '\n\t');
}