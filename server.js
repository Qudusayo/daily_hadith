require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const TeleBot = require("telebot");
const axios = require("axios");

const Model = require("./Model");
const server = express();

// Connect to database
mongoose
    .connect(process.env.MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Mongoose Coonected"))
    .catch((err) => console.log(err));

//instantiate Telebot with our token got in the BtFather
const bot = new TeleBot({
    token: process.env.TELEGRAM_BOT_TOKEN,
});

bot.on(["/start", "/salam"], (msg) => {
    return bot.sendMessage(
        msg.from.id,
        `Assalamun alaykum warahmatullahi wabarakaatuh Dear ${msg.from.username}
        
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

bot.on(["/help"], (msg) => {
    bot.sendMessage(
        msg.from.id,
        `
Assalamun alykum dear ${msg.from.username}

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

bot.on(["/hadith"], (msg) => {
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
                msg.from.id,
                data.hadith[0].body.replace(/<[^>]*>?/gm, "")
            );
        })
        .catch((err) => console.log(err));
});

bot.on(["/subscribe"], (msg) => {
    const user = {
        id: msg.from.id,
        username: msg.from.username,
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

bot.on(["/unsubscribe"], (msg) => {
    bot.sendMessage(
        msg.from.id,
        `
Hi Dear, We're still working on the /unsubscribe .Probably, it seems we're disturbing you, but not. Kindly bare with us You will be recieving hadith every 3 hours insha Allah.

Kindly share me to your friends https://t.me/DailyHadithDrop_bot
    `
    );
});

function test() {
    Model.find({}).then((result) =>
        result.forEach((user) => console.log(user.id, user.username))
    );
}
test();

bot.start();
server.listen(3000, () => console.log(`Server started on port 3000`));
