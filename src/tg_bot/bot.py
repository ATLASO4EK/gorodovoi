from telebot.async_telebot import AsyncTeleBot
from telebot.asyncio_storage import StateMemoryStorage

token = ""
bot = AsyncTeleBot(token, state_storage=StateMemoryStorage())