from telebot.states.sync import StateContext
import json, requests
from telebot import types

from src.config import get_api
import pandas as pd
from bot import bot
from states import MyStates

@bot.callback_query_handler(func=lambda call: call.data == 'reg')
async def auth(callback, state: StateContext):
    url = f"{get_api()}private/tg"
    params={}
    try:
        regs = pd.DataFrame(columns=['id','tg_id'], data= json.loads(requests.get(url).content.decode('utf-8')))['tg_id'].tolist()
        print(regs)
    except Exception as e:
        print(e)
        await bot.send_message(text='Произошла непредвиденная ошибка,\n'
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
        await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                    'Попробуйте использовать /start еще раз или чуть позже',
                               chat_id=callback.message.chat.id)
        return

    if params['tg_id'] not in regs:
        try:
            suc = requests.post(url, params=params)
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

@bot.callback_query_handler(func=lambda call: call.data == 'InfoAboutCar')
async def InfoAboutCar(callback, state: StateContext):
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
    await state.set(state=MyStates.car_plate)

    # Отладочная информация
    current_state = await bot.get_state(user_id=userid, chat_id=chatid)
    print(f"State after set_state: {current_state}")  # Должен быть MyStates.car_plate

    await bot.send_message(chat_id=callback.message.chat.id, text='Введите номер машины\nПример: А001АА\nВсе буквы заглавные, регион не нужен.')

@bot.message_handler(state=MyStates.car_plate)
async def infoaboutcar_plate(message: types.Message, state: StateContext):
    async with state.data() as data:
        try:
            userid = int(data.get('userid'))
            chatid = int(data.get('chatid'))
        except Exception as e:
            print(e)
            await bot.send_message(text='Произошла непредвиденная ошибка,\n'
                                        'Попробуйте использовать /start еще раз или чуть позже',
                                   chat_id=message.chat.id)
            return
    plate = message.text

    url = f'{get_api()}tracks_traffic/coop_analytics'

    await bot.send_message(chat_id=chatid, text='Арбуз')


