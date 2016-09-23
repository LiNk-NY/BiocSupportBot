var Botkit = require("./lib/Botkit.js");
var os = require("os");

var controller = Botkit.slackbot({
    debug: true
});

var bot = controller.spawn({
    token: "xoxb-79376930049-QIb7wSfKgA55rxHDdUNBIvtp"
}).startRTM();

controller.hears(["hello", "hi"], "direct_message,direct_mention,mention", function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: "robot_face",
    }, function(err, res) {
        if (err) {
            bot.botkit.log("Failed to add emoji reaction :(", err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, "Hello " + user.name + "!!");
        } else {
            bot.reply(message, "Hello.");
        }
    });
});


controller.hears(["shutdown"], "direct_message,direct_mention,mention", function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask("Are you sure you want me to shutdown?", [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say("You'll be seeing my trucks on every corner!");
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say("*That's what I thought!*");
                convo.next();
            }
        }
        ]);
    });
});

controller.hears(["uptime", "identify yourself", "who are you", "what is your name", "what are you"],
    "direct_message,direct_mention,mention", function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ":taco: :robot_face: I am a bot named <@" + bot.identity.name +
             ">. I have been running for " + uptime + " on someone's computer.");

    });

function formatUptime(uptime) {
    var unit = "second";
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = "minute";
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = "hour";
    }
    if (uptime != 1) {
        unit = unit + "s";
    }

    uptime = uptime + " " + unit;
    return uptime;
}

var ALL_MENTION = ["message_received", "direct_message", "direct_mention", "mention", "ambient"]; 

controller.hears([":taco:"], ALL_MENTION, function(bot, message) {
    bot.reply(message, "Tacos for everyone!");
});

controller.hears([":hotsauce:"], ALL_MENTION, function(bot, message) {
    bot.reply(message, "Would you like some sauce with that?");
});

controller.hears(["tacotime"], ALL_MENTION, function(bot,message) {
    askFlavor = function(response, convo) {
      convo.ask("Orale! What kind of tacos do you want?", function(response, convo) {
        convo.say("I like those too!");
        askSize(response, convo);
        convo.next();
      });
    }
    askSize = function(response, convo) {
      convo.ask("How many do you want?", function(response, convo) {
        convo.say("Sale!")
        askWhereDeliver(response, convo);
        convo.next();
      });
    }
    askWhereDeliver = function(response, convo) {
      convo.ask("Where do you want it delivered?", function(response, convo) {
        convo.say("I'll be downstairs in 20! :bicyclist:");
        convo.next();
      });
    }

    bot.startConversation(message, askFlavor);
});

