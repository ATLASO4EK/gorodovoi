from telebot.async_telebot import AsyncTeleBot
from telebot.asyncio_storage import StateMemoryStorage
from config import getBotToken

token = getBotToken()
bot = AsyncTeleBot(token, state_storage=StateMemoryStorage())