const axios = require("axios");
const http = require("http");
const HttpsProxyAgent = require("https-proxy-agent");
const {Telegraf} = require("telegraf");

const stack = {};

const checkUrl = async (ctx, url, proxy, firstCheck)=>{
    try{
        const agent = new HttpsProxyAgent.HttpsProxyAgent(proxy);
        const response = await axios.get(url, {
            proxy: false,
            httpsAgent: agent
        });
        const date = new Date();

        if (date.getHours() === 12 || firstCheck)
            await ctx.reply(`Доступ к сайту ${url} разрешен`);
    }
    catch (e) {
        await ctx.reply(`Сайт ${url} заблокирован`);
        clearTimeout(stack[url]);
        delete stack[url];
    }
}


const bot = new Telegraf("5744846835:AAG94pBVCmBMky_6Kv39gYfh6LHNesg1TSU");
bot.start(async ctx => await ctx.reply("Бот проверки доступа к сайту\nОтправьте прокси:url\n(http://username:password@ip:port - https://google.com)"));

bot.on('text', async (ctx) => {
    const info = ctx.message?.text.split(" - ");
    if (info.length!==2){
        await ctx.reply("Неверно введен формат запроса");
    }
    stack[info[1]] = setInterval(()=>checkUrl(ctx, info[1], info[0]), 3.6 * Math.pow(10, 6));
    await ctx.reply(`Сайт ${info[1]} добавлен в часовую проверку`);
    await checkUrl(ctx, info[1], info[0], true);
});

(async ()=>{
    try {
        console.log("Bot started");
        await bot.launch();
    }
    catch (e) {
        console.log(`Bot error: ${e.message}`);
    }
})();