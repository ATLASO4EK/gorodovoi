from telebot.states.sync import StateContext
from Requests import regs
from bot import bot
import json
from Requests import respons
import requests
from telebot import types
from message_handler import main_page
from datetime import datetime as dt
from src.API.private_info_handlers.handlers_tg import *
from states import MyStates



@bot.callback_query_handler(func= lambda callback: callback.data == 'reg')
async def check_callback(callback, state: StateContext):
    #регистрация
    params= {}
    responce={}
    url = 'http://127.0.0.1:8000/api/v1/tg'
    responce= request.get(url, responce)
    regs=json.loads(responce.content.decode('utf-8'))
    async with state.data() as data:
        params['tg_id'] = data.get('userid')
    if callback.message.from_user.id not in regs:
        responc = requests.post(url, params)
        await bot.send_message(callback.message.chat.id,'New authorized')
    else:
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