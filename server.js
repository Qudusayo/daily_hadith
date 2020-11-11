require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const Model = require("./Model");
const server = express();
const token = process.env.TELEGRAM_BOT_TOKEN;

// Connect to database
mongoose
    .connect(process.env.MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Mongoose Coonected"))
    .catch((err) => console.log(err));

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg, match) => {
    return bot.sendMessage(
        msg.chat.id,
        `Assalamun alaykum warahmatullahi wabarakaatuh Dear ${msg.chat.username}
        
It's good if you can share people my link to add me up for hadith, but note that you have to /subscribe to get subscribed.

"Allah (swt) sent us Muhammad (saas) as the prophet at a time when we knew nothing. Whatever we saw Muhammad do, we do the same, in the same way." (al-Nasa'i, Taqsir 1)

You can:
/help to get help
/start to get started
/subscribe to get subscribed
/unsubscribe to get unsubscribed
/hadith to get a random hadith anytime`
    );
});

bot.onText(/\/help/, (msg, match) => {
    bot.sendMessage(
        msg.chat.id,
        `
Assalamun alykum dear ${msg.chat.username}

You can:
/help to get help
/start to get started
/subscribe to get subscribed
/unsubscribe to get unsubscribed
/hadith to get a random hadith anytime
    `
    );
});

setTimeout(() => {
    axios({
        method: "get",
        url: "https://api.sunnah.com/v1/hadiths/random",
        headers: {
            "x-api-key": process.env.HADITH_API_KEY,
        },
    })
        .then((res) => res.data)
        .then((data) => {
            Model.find({}).then((result) =>
                result.forEach((user) =>
                    bot.sendMessage(
                        user.id,
                        "السلام عليكم ورحمة الله وبركاته\n\n" +
                            data.hadith[0].body.replace(/<[^>]*>?/gm, "")
                    )
                )
            );
        })
        .catch((err) => console.log(err));
}, 10800000);

bot.onText(/\/hadith/, (msg, match) => {
    return axios({
        method: "get",
        url: "https://api.sunnah.com/v1/hadiths/random",
        headers: {
            "x-api-key": process.env.HADITH_API_KEY,
        },
    })
        .then((res) => res.data)
        .then((data) => {
            bot.sendMessage(
                msg.chat.id,
                data.hadith[0].body.replace(/<[^>]*>?/gm, "")
            );
        })
        .catch((err) => console.log(err));
});

bot.onText(/\/subscribe/, (msg, match) => {
    const user = {
        id: msg.chat.id,
        username: msg.chat.username,
    };
    Model.find({ id: user.id }).then((users) => {
        if (users.length === 0) {
            const subscriber = new Model(user);
            subscriber.save().then(() =>
                bot.sendMessage(
                    user.id,
                    `
Hi Dear, You've successfully subscribed to daily hadith. You will be recieving hadith every 3 hours insha Allah.

Kindly share me to your friends https://t.me/DailyHadithDrop_bot
            `
                )
            );
        } else {
            bot.sendMessage(
                user.id,
                `
Hi Dear, You've subscribed to daily hadith already. You will be recieving hadith every 3 hours insha Allah.

Kindly share me to your friends https://t.me/DailyHadithDrop_bot
            `
            );
        }
    });
});

bot.onText(/\/unsubscribe/, (msg, match) => {
    console.log(msg);
    bot.sendMessage(
        msg.chat.id,
        `
Hi Dear, We're still working on the /unsubscribe .Probably, it seems we're disturbing you, but not. Kindly bare with us You will be recieving hadith every 3 hours insha Allah.

Kindly share me to your friends https://t.me/DailyHadithDrop_bot
    `
    );
});

bot.on("new_chat_members", (user, match) => {
    const msg = `
Assalamun alaykum warahmatullahi wabarakaatuh Dear ${user.new_chat_member.username}
Kindly  Share your friends https://t.me/DailyHadithDrop_bot,
and also kindly subscribe to /subscribe@DailyHadithDrop_bot.
`;
    bot.sendMessage(user.chat.id, msg);
});

server.listen(3000, () => console.log(`Server started on port 3000`));

