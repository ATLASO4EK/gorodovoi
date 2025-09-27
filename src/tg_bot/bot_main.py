import asyncio
from telebot import asyncio_filters
from callback_data import *

bot.add_custom_filter(asyncio_filters.StateFilter(bot))
bot.add_custom_filter(asyncio_filters.IsDigitFilter())
bot.add_custom_filter(asyncio_filters.TextMatchFilter())

# necessary for state parameter in handlers.
from telebot.states.asyncio.middleware import StateMiddleware

bot.setup_middleware(StateMiddleware(bot))

# Start polling
import asyncio

print('bot started')
asyncio.run(bot.polling())