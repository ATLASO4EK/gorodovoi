import asyncio
from telebot import asyncio_filters
from callback_data import *
import schedule, time, requests, json
import numpy as np

bot.add_custom_filter(asyncio_filters.StateFilter(bot))
bot.add_custom_filter(asyncio_filters.IsDigitFilter())
bot.add_custom_filter(asyncio_filters.TextMatchFilter())

# necessary for state parameter in handlers.
from telebot.states.asyncio.middleware import StateMiddleware

bot.setup_middleware(StateMiddleware(bot))

# Start polling
import asyncio

@bot.message_handler(commands=['start'])
async def AddNotif(message, state: StateContext,):
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

    url = 'http://127.0.0.1:8000/api/v1/tg'
    params = {}
    params['isnotifon']=True
    resp = json.loads(requests.get(url=url, params=params).content.decode('utf-8'))
    IdTg = np.asarray(resp)
    IdTg=list(map(lambda x: x[0], IdTg))
    print(IdTg)

    if userid in IdTg:
        #сюда надо бы с пробок выводить инфу, но бд не робит
        bot.send_message(message.chat.id,text="текст оповещения")
    elif not userid in IdTg:
        await auth(message, state)
        await bot.send_message(text='Произведена новая регистрация', chat_id=chatid)
        


schedule.every().hour.do(AddNotif)

schedule.run_pending()
time.sleep(1)

print('bot started')
asyncio.run(bot.polling())