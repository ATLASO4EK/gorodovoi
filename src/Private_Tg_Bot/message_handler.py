from telebot.apihelper import send_message
from telebot.states.sync.context import StateContext
from bot import *
from telebot import types
from states import MyStates

@bot.message_handler(commands=['start'])
async def welcome_page(message, state: StateContext):
    markup = types.InlineKeyboardMarkup()
    button = types.InlineKeyboardButton(text="регистрация", callback_data='reg')
    markup.add(button)

    await bot.set_state(user_id=message.from_user.id, chat_id=message.chat.id, state=MyStates.user_id)
    await state.add_data(userid=message.from_user.id)
    await state.add_data(chatid=message.chat.id)
    await bot.send_message(message.chat.id,
                           text="привет, это закрытый бот для анализа трафика, который пока что находится в публичной бете,"
                                " сейчас доступна регитвсрация по кнопке ниже", reply_markup=markup)

@bot.message_handler(commands=['menu'], content_types=['text'])
async def menu_page(message, state: StateContext):
    markup = types.InlineKeyboardMarkup()
    button = types.InlineKeyboardButton(text="ДА", callback_data="InfoAboutCar")
    markup.add(button)
    count1 = 0
    count2 = 0
    await state.add_data(counter1=count1, counter2=count2)

    await bot.send_message(message.chat.id, text="Гос номер вашей машины А666АА?",reply_markup=markup)