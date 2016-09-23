var Botkit = require("./lib/Botkit.js");
var os = require("os");

var controller = Botkit.slackbot({
    debug: true
});

var bot = controller.spawn({
    token: ""
}).startRTM();

controller.hears(["hello", "hi", "hey"], "direct_message, direct_mention, mention",
        function(bot, message) {

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

controller.hears(["shutdown"], "direct_message,direct_mention,mention",
        function(bot, message) {

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

