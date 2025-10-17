from telebot.async_telebot import AsyncTeleBot
from telebot.asyncio_storage import StateMemoryStorage
from src.config import getPrivateBotToken

token = getPrivateBotToken()
bot = AsyncTeleBot(token, state_storage=StateMemoryStorage())