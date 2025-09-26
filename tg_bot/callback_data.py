from bot import bot
from Requests import respons
from telebot import types
from message_handler import main_page
from datetime import datetime as dt

@bot.callback_query_handler(func= lambda callback: callback.data == 'reg')
async def check_callback(callback):
    #я так полагаю, что ты тут будешь писать регистрацию
    await bot.send_message(callback.message.chat.id, "successful authorized")
    await main_page(callback.message)

@bot.callback_query_handler(func=lambda callback: callback.data == 'News')
async def check_callback(callback):
    #news
    markup = types.InlineKeyboardMarkup()
    button4 = types.InlineKeyboardButton(text="Назад", callback_data='back')
    markup.add(button4)

    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await bot.send_message(callback.message.chat.id, f"Сноска последних новостей.\n1){respons[0][3]} {respons[0][4]} {respons[0][5]}\n"+ f"<i>{respons[0][2]}</i> \n <i>{dt.strptime(respons[0][1],'%a, %d %b %Y %H:%M:%S GMT')}</i>\n"
                                                     f"2){respons[1][5]} {respons[1][4]} \n"+f" <i>{respons[1][2]}</i> \n<i>{ dt.strptime(respons[1][1],'%a, %d %b %Y %H:%M:%S GMT')}</i>", parse_mode='HTML', reply_markup=markup)

@bot.callback_query_handler(func= lambda callback: callback.data == 'jams')
async def check_callback(callback):
    #traffic jams
    markup = types.InlineKeyboardMarkup()
    button4 = types.InlineKeyboardButton(text="Назад", callback_data='back')
    markup.add(button4)

    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await bot.send_message(callback.message.chat.id, "jams", reply_markup=markup)

@bot.callback_query_handler(func= lambda callback: callback.data == 'profile')
async def check_callback(callback):
    #profile

    markup = types.InlineKeyboardMarkup()
    button4 = types.InlineKeyboardButton(text="Назад", callback_data='back')
    button3 = types.InlineKeyboardButton(text="Включить оповещение о пробках", callback_data='NewsAboutCity')

    markup.add(button3,button4)

    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await bot.send_message(callback.message.chat.id, f"Привет {callback.message.chat.first_name}!", reply_markup=markup)

@bot.callback_query_handler(func= lambda callback: callback.data == 'back')
async def check_callback(callback):
    #profile
    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await main_page(callback.message)