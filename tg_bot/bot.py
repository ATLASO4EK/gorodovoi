from telebot.async_telebot import AsyncTeleBot
from telebot.asyncio_storage import StateMemoryStorage

token = "8248257481:AAEt4tVIsAA-s_sLKCWu9bOuQoC7oy7CMjY"
bot = AsyncTeleBot(token, state_storage=StateMemoryStorage())