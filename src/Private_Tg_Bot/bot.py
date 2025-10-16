from telebot.async_telebot import AsyncTeleBot
from telebot.asyncio_storage import StateMemoryStorage
from config import getMVPBotToken

token = getMVPBotToken()
bot = AsyncTeleBot(token, state_storage=StateMemoryStorage())