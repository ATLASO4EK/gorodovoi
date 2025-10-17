from telebot.states.sync.context import StateContext
from bot import *
from telebot import types
from states import MyStates

@bot.message_handler(commands=['start'])
async def welcome_page(message, state: StateContext):
    markup = types.InlineKeyboardMarkup()
    button = types.InlineKeyboardButton(text="Регистрация", callback_data='reg')
    markup.add(button)

    await bot.set_state(user_id=message.from_user.id, chat_id=message.chat.id, state=MyStates.user_id)
    await state.add_data(userid=message.from_user.id)
    await state.add_data(chatid=message.chat.id)
    await state.add_data(min_nodes=3)
    await bot.send_message(message.chat.id,
                           text="Привет, это закрытый бот для анализа трафика, который пока что находится в публичном бета-тестировании,"
                                " сейчас доступна регистрация по кнопке ниже", reply_markup=markup)

@bot.message_handler(commands=['menu'], content_types=['text'])
async def menu_page(message, state: StateContext):
    markup = types.InlineKeyboardMarkup(row_width=1)
    button = types.InlineKeyboardButton(text="Получить анализ машины", callback_data="InfoAboutCar")
    markup.add(button)
    await bot.send_message(message.chat.id, text="Главное меню.",reply_markup=markup)