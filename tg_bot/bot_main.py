import asyncio

from bot import bot
from message_handler import *
from callback_data import *

asyncio.run(bot.infinity_polling())