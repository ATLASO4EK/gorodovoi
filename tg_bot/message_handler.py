from telebot.states.sync.context import StateContext
from bot import *
from telebot import types
from states import MyStates

@bot.message_handler(commands=['start'])
async def welcome_page(message, state: StateContext):
    #welcome page

    markup= types.InlineKeyboardMarkup()
    button= types.InlineKeyboardButton(text="главное меню", callback_data='reg')
    markup.add(button)
    text = 'Вас приветствует ЦОДД Смоленска!\nЭтот телеграмм бот создан, что бы помочь понять ситуацию на дорогах.\nЧтобы пользоваться ботом вам нужно зарегестрироваться по кнопке ниже.'
    await bot.set_state(user_id=message.from_user.id, chat_id=message.chat.id, state=MyStates.login)
    await state.add_data(userid=message.from_user.id)
    await bot.send_message(message.chat.id, text, reply_markup=markup)


@bot.message_handler(commands=['main'])
async def main_page(message):
    #main page
    markup = types.InlineKeyboardMarkup()
    button1 = types.InlineKeyboardButton(text="Новости", callback_data='News')
    button2 = types.InlineKeyboardButton(text="Пробки", callback_data='jams')
    button3 = types.InlineKeyboardButton(text="Профиль", callback_data='profile')
    markup.add(button1,button2,button3)
    text = 'Что хотите узнать?'
    await bot.send_message(message.chat.id, text, reply_markup=markup)

