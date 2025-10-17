import asyncio
from telebot.states.asyncio.middleware import StateMiddleware
from callback_data import *
from message_handler import *
from bot import bot
from telebot import asyncio_filters

bot.add_custom_filter(asyncio_filters.StateFilter(bot))
bot.setup_middleware(StateMiddleware(bot))

if __name__ == '__main__':
    print('bot started')
    asyncio.run(bot.polling())