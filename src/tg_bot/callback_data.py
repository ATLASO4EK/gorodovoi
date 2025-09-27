from telebot.states.sync import StateContext
from bot import bot
import json
import requests
from telebot import types
from message_handler import main_page
from datetime import datetime as dt
import pandas as pd
from src.API.private_info_handlers.handlers_tg import *
from states import MyStates

# Callback регистрации
@bot.callback_query_handler(func= lambda callback: callback.data == 'reg')
async def check_callback(callback, state: StateContext):
    url = 'http://127.0.0.1:8000/api/v1/tg'
    params = {}

    try:
        regs=pd.DataFrame(columns=['id','tg_id','isnotifon'],data=json.loads(requests.get(url).content.decode('utf-8')))['tg_id'].tolist()
    except Exception as e:
        print(e)
        await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                    'Попробуйте использовать /start еще раз или чуть позже',
                                       chat_id=callback.message.chat.id)
        return
    try:
        async with state.data() as data:
            userid = int(data.get('userid'))
        params['tg_id'] = userid
        params['isnotifon'] = False
    except Exception as e:
        print(e)
        await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                    'Попробуйте использовать /start еще раз или чуть позже',
                                       chat_id=callback.message.chat.id)
        return

    if params['tg_id'] not in regs:
        try:
            suc = requests.post(url, params=params)
            if not suc:
                await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                            'Попробуйте использовать /start еще раз или чуть позже',
                                       chat_id=callback.message.chat.id)
                return
        except Exception as e:
            print(e)
            await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                        'Попробуйте использовать /start еще раз или чуть позже', chat_id=callback.message.chat.id)
            return
    await main_page(callback.message)



# Callback с новостями
@bot.callback_query_handler(func=lambda callback: callback.data == 'News')
async def check_callback(callback):

    markup = types.InlineKeyboardMarkup()
    button4 = types.InlineKeyboardButton(text="Назад", callback_data='back')
    markup.add(button4)

    url = 'http://127.0.0.1:8000/api/v1/News'
    params = {'filters':'tg'}

    try:
        news_data = json.loads(requests.get(url, params=params).content.decode('utf-8'))
    except Exception as e:
        print(e)
        await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                    'Попробуйте позже', markup=markup, chat_id=callback.message.chat.id)
        return

    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await bot.send_message(callback.message.chat.id, f"Сноска последних новостей.\n"
                                                     f"1) {news_data[0][3]}\n{news_data[0][4]}\n"+ f"<i>{news_data[0][2]}</i> \n<i>{dt.strptime(news_data[0][1],'%a, %d %b %Y %H:%M:%S GMT')}</i>\n"
                                                     f"2) {news_data[1][5]}\n{news_data[1][4]}\n"+f"<i>{news_data[1][2]}</i>\n<i>{ dt.strptime(news_data[1][1],'%a, %d %b %Y %H:%M:%S GMT')}</i>", parse_mode='HTML', reply_markup=markup)
    return

# Callback пробок
@bot.callback_query_handler(func= lambda callback: callback.data == 'jams')
async def check_callback(callback):
    markup = types.InlineKeyboardMarkup()
    button4 = types.InlineKeyboardButton(text="Назад", callback_data='back')
    markup.add(button4)

    url = 'http://127.0.0.1:8000/api/v1/jams'

    try:
        jams_data = json.loads(requests.get(url).content.decode('utf-8'))
    except Exception as e:
        print(e)
        await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                    'Попробуйте позже', markup=markup, chat_id=callback.message.chat.id)
        return

    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await bot.send_message(callback.message.chat.id, f"Предполагаем, что баллы пробок будут такие:\n"
                                                     f"{jams_data[0][0]}:00 - {jams_data[0][1]}\n"
                                                     f"{jams_data[1][0]}:00 - {jams_data[1][1]}\n"
                                                     f"{jams_data[2][0]}:00 - {jams_data[2][1]}\n"
                                                     f"{jams_data[3][0]}:00 - {jams_data[3][1]}",
                                                     reply_markup=markup)
    return

# Callback профиля
@bot.callback_query_handler(func= lambda callback: callback.data == 'profile')
async def check_callback(callback):
    markup = types.InlineKeyboardMarkup(row_width=2)
    button4 = types.InlineKeyboardButton(text="Назад", callback_data='back')
    button3 = types.InlineKeyboardButton(text="Включить оповещение о пробках", callback_data='NewsAboutCity')
    button5 = types.InlineKeyboardButton(text="Оставить отзыв", callback_data='review')

    markup.add(button3,button4,button5)

    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await bot.send_message(callback.message.chat.id, f"Привет {callback.message.chat.first_name}!", reply_markup=markup)
    return

# Callback отзыва
@bot.callback_query_handler(func= lambda callback: callback.data == 'review')
async def check_callback(callback):
    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await bot.send_message(callback.message.chat.id, f"Напишите свой отзыв или предложения для улучшения сервисов ЦОДД!")
    await bot.set_state(chat_id=callback.message.chat.id, user_id=callback.message.from_user.id, state=MyStates.review)
    return

# Получение отзыва
@bot.callback_query_handler(func= lambda callback: callback.data == 'review')
async def check_callback(callback):
    markup = types.InlineKeyboardMarkup(row_width=2)
    button4 = types.InlineKeyboardButton(text="Назад", callback_data='back')
    markup.add(button4)

    await bot.send_message(callback.message.chat.id, f"Спасибо за ваше мнение!", reply_markup=markup)
    return

# Главное меню
@bot.callback_query_handler(func= lambda callback: callback.data == 'back')
async def check_callback(callback):
    #profile
    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await main_page(callback.message)
    return