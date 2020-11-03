require("dotenv").config();
var express = require("express");
var server = express();
const TeleBot = require("telebot");
const axios = require("axios");

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
Assalamun alykum dear ${msg.from.id}

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
    const groupsId = ["-1001475421091_15457498531747688885"];
    groupsId.forEach((group) => {
        axios({
            method: "get",
            url: "https://api.sunnah.com/v1/hadiths/random",
            headers: {
                "x-api-key": process.env.HADITH_API_KEY,
            },
        })
            .then((res) => res.data)
            .then((data) => {
                bot.sendMessage(
                    group,
                    "السلام عليكم ورحمة الله وبركاته\n\n" +
                        data.hadith[0].body.replace(/<[^>]*>?/gm, "")
                );
            })
            .catch((err) => console.log(err));
    });
}, 10800000);

bot.on(["/hadith"], (msg) => {
    return axios({
        method: "get",
        url: "https://api.sunnah.com/v1/hadiths/random",
        headers: {
            "x-api-key": "SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk",
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

bot.start();
server.listen(3000, () => console.log(`Server started on port 3000`));