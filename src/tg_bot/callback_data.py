from telebot.states.sync import StateContext
from bot import bot
import json
import requests
from telebot import types
from message_handler import main_page
from datetime import datetime as dt
import pandas as pd
from src.API.private_info_handlers.handlers_tg import *
from src.config import get_api
from states import MyStates
from telebot.types import ReplyParameters
from datetime import datetime

# Callback регистрации
@bot.callback_query_handler(func=lambda callback: callback.data == 'reg')
async def auth(callback, state: StateContext):
    url = f'{get_api()}tg'
    params = {}

    try:
        regs = pd.DataFrame(columns=['id', 'tg_id', 'isnotifon', 'chat_id'],
                         data=json.loads(requests.get(url).content.decode('utf-8')))[
                'tg_id'].tolist()
    except Exception as e:
        print(e)
        await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                    'Попробуйте использовать /start еще раз или чуть позже',
                               chat_id=callback.message.chat.id)
        return
    try:
        async with state.data() as data:
            userid = int(data.get('userid'))
            chatid = int(data.get('chatid'))
        params['tg_id'] = userid
        params['isnotifon'] = False
        params['chat_id'] = chatid
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
                                        'Попробуйте использовать /start еще раз или чуть позже',
                                   chat_id=callback.message.chat.id)
            return
    async with state.data() as data:
        try:
            userid = int(data.get('userid'))
            chatid = int(data.get('chatid'))
        except Exception as e:
            print(e)
            await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                        'Попробуйте использовать /start еще раз или чуть позже',
                                   chat_id=callback.message.chat.id)
            return
    await bot.set_state(user_id=userid, chat_id=chatid, state=MyStates.mainmenu)
    await bot.send_message(chat_id=callback.message.chat.id, text='Используйте /menu чтобы войти в меню')


# Callback с новостями
@bot.callback_query_handler(func=lambda callback: callback.data == 'News')
async def news(callback, state: StateContext):
    markup = types.InlineKeyboardMarkup()
    button4 = types.InlineKeyboardButton(text="Назад", callback_data='back')
    markup.add(button4)

    url = f'{get_api()}News'
    params = {'filters': 'tg'}

    try:
        news_data = json.loads(requests.get(url, params=params).content.decode('utf-8'))
    except Exception as e:
        print(e)
        await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                    'Попробуйте позже', markup=markup, chat_id=callback.message.chat.id)
        return

    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await bot.send_message(callback.message.chat.id, f"Сноска последних новостей.\n"
                                                     f"1) {news_data[0][3]}\n{news_data[0][4]}\n" + f"<i>{news_data[0][2]}</i> \n<i>{dt.strptime(news_data[0][1], '%a, %d %b %Y %H:%M:%S GMT')}</i>\n"
                                                                                                    f"2) {news_data[1][5]}\n{news_data[1][4]}\n" + f"<i>{news_data[1][2]}</i>\n<i>{dt.strptime(news_data[1][1], '%a, %d %b %Y %H:%M:%S GMT')}</i>",
                           parse_mode='HTML', reply_markup=markup)
    return


# Callback пробок
@bot.callback_query_handler(func=lambda callback: callback.data == 'jams')
async def jams(callback, state: StateContext):
    markup = types.InlineKeyboardMarkup()
    button4 = types.InlineKeyboardButton(text="Назад", callback_data='back')
    markup.add(button4)

    url = f'{get_api()}jams'

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
@bot.callback_query_handler(func=lambda callback: callback.data == 'profile')
async def profile(callback, state: StateContext):
    markup = types.InlineKeyboardMarkup(row_width=1)
    button4 = types.InlineKeyboardButton(text="Назад", callback_data='back')
    button3 = types.InlineKeyboardButton(text="Уведомления", callback_data='NewsAboutCity')
    button5 = types.InlineKeyboardButton(text="Оставить отзыв", callback_data='review')

    markup.add(button4, button3, button5)

    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await bot.send_message(callback.message.chat.id, f"Привет {callback.message.chat.first_name}!", reply_markup=markup)

@bot.callback_query_handler(func= lambda callback: callback.data=='NewsAboutCity')
async def Notification(callback, state: StateContext):
    async with state.data() as data:
        try:
            userid = int(data.get('userid'))
            chatid = int(data.get('chatid'))
        except Exception as e:
            print(e)
            await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                        'Попробуйте использовать /start еще раз или чуть позже',
                                   chat_id=callback.message.chat.id)
            return

    url = f'{get_api()}tg'
    params = {}
    params['tg_id']= userid
    resp=json.loads(requests.get(url=url, params=params).content.decode('utf-8'))
    isnotifon = resp[0][2]

    markup = types.InlineKeyboardMarkup()
    button = types.InlineKeyboardButton(text="Назад", callback_data='back')
    markup.add(button)

    if isnotifon==False:
        await bot.answer_callback_query(callback_query_id=callback.id, text='Уведомления включены')
        params['isnotifon']=True
        resp=requests.put(url=url, params=params)
        await main_page(callback.message,state)
    else:
        await bot.answer_callback_query(callback_query_id=callback.id, text='Уведомления выключены')
        params['isnotifon'] = False
        resp=requests.put(url=url, params=params)
        await main_page(callback.message, state)
    await bot.delete_message(callback.message.chat.id, callback.message.message_id)


# Callback отзыва
@bot.callback_query_handler(func=lambda callback: callback.data == 'review')
async def get_review_text(callback: types.CallbackQuery, state: StateContext):

    async with state.data() as data:
        try:
            userid = int(data.get('userid'))
            chatid = int(data.get('chatid'))
        except Exception as e:
            print(e)
            await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                        'Попробуйте использовать /start еще раз или чуть позже',
                                   chat_id=callback.message.chat.id)
            return

    await bot.set_state(state=MyStates.review, user_id=userid, chat_id=chatid)
    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await bot.send_message(callback.message.chat.id,
                           f"Напишите свой отзыв или предложения для улучшения сервисов ЦОДД!")


# Получение отзыва
@bot.message_handler(state=MyStates.review)
async def get_review(message: types.Message, state: StateContext):

    async with state.data() as data:
        userid = int(data.get('userid'))
        chatid = int(data.get('chatid'))

    await bot.set_state(chat_id=chatid, user_id=userid,
                        state=MyStates.mainmenu)

    text = message.text
    url = f'{get_api()}reviews'
    date = datetime.now()
    params={}
    params['datetime'] = date
    params['text']=text
    requests.post(url,params=params)

    markup = types.InlineKeyboardMarkup(row_width=2)
    button4 = types.InlineKeyboardButton(text="Назад", callback_data='back')
    markup.add(button4)

    await bot.send_message(message.chat.id, f"Спасибо за ваше мнение!", reply_markup=markup,
        reply_parameters=ReplyParameters(message_id=message.message_id))
    return


# Главное меню
@bot.callback_query_handler(func=lambda callback: callback.data == 'back')
async def back_to_menu(callback, state: StateContext):
    await bot.delete_message(callback.message.chat.id, callback.message.message_id)
    await bot.set_state(chat_id=callback.message.chat.id, user_id=callback.message.from_user.id,
                        state=MyStates.mainmenu)
    await main_page(callback.message, state)
    return
