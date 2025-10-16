from idlelib.rpc import response_queue

import aiohttp
from pyexpat.errors import messages
from sqlalchemy.util import counter
from telebot.states.sync import StateContext
import json, requests
from telebot import types
from message_handler import menu_page
from config import get_api
import pandas as pd
from bot import bot
from states import MyStates



@bot.callback_query_handler(func=lambda call: call.data == 'reg')
async def auth(callback, state: StateContext):
    url = f"{get_api()}private_tg/users"
    params={}
    try:
        regs = pd.DataFrame(columns=['id','tg_id'], data= json.loads(requests.get(url).content.decode('utf-8')))['tg_id'].tolist()
        print(regs)
    except Exception as e:
        print(e)
        await bot.send_message(text='1)Произошла непредвиденная ошибка,\n'
                                    'Попробуйте использовать /start еще раз или чуть позже',
                               chat_id=callback.message.chat.id)
        return
    try:
        async with state.data() as data:
            print(data)
            userid= int(data.get('userid'))
        params['tg_id']= userid
    except Exception as e:
        print(e)
        await bot.send_message(text='2)Произошла непредвиденная ошибка,\n'
                                    'Попробуйте использовать /start еще раз или чуть позже',
                               chat_id=callback.message.chat.id)
        return

    if params['tg_id'] not in regs:
        try:
            suc = requests.post(url, params=params)
        except Exception as e:
            print(e)
            await bot.send_message(text='3)Произошла непредвиденная ошибка,\n'
                                        'Попробуйте использовать /start еще раз или чуть позже',
                                   chat_id=callback.message.chat.id)
            return

    async with state.data() as data:
        try:
            userid = int(data.get('userid'))
            chatid = int(data.get('chatid'))
        except Exception as e:
            print(e)
            await bot.send_message(text='4)Произошла непредвиденная ошибка,\n'
                                        'Попробуйте использовать /start еще раз или чуть позже',
                                   chat_id=callback.message.chat.id)
            return
    await bot.set_state(user_id=userid, chat_id=chatid, state=MyStates.mainmenu)
    await bot.send_message(chat_id=callback.message.chat.id, text='Используйте /menu чтобы войти в меню')

@bot.callback_query_handler(func=lambda call: call.data == 'InfoAboutCar')
async def InfoAboutCar(callback, state: StateContext):
    url = "https://yandex.ru/images/search?from=tabbar&img_url=https%3A%2F%2Fwww.picng.com%2Fupload%2Fcat%2Fpng_cat_587.png&lr=65&pos=1&rpt=simage&text=скачать%20картинку%20кота%20в%20пнг"
    markup = types.InlineKeyboardMarkup(row_width=3)
    button1 = types.InlineKeyboardButton(text='<',callback_data='Lower')
    button2 = types.InlineKeyboardButton(text="0",callback_data="counter1")
    button3 = types.InlineKeyboardButton(text='>',callback_data='Upper')
    button4 = types.InlineKeyboardButton(text="0",callback_data='counter2')
    markup.add(button1,button2,button3,button1,button4,button3)

    await bot.send_photo(callback.message.chat.id, url)
    await bot.send_message(callback.message.chat.id, text="Информация о транспорте")
    await bot.send_message(callback.message.chat.id, text="Укажите фильтры", reply_markup=markup)