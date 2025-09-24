import asyncio
from telebot.async_telebot import AsyncTeleBot
from telebot import types
from callback_data import *

token = "8248257481:AAEt4tVIsAA-s_sLKCWu9bOuQoC7oy7CMjY"
bot = AsyncTeleBot(token)

asyncio.run(bot.infinity_polling())