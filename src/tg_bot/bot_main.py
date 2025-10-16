import asyncio
from multiprocessing import Process
from telebot import asyncio_filters
from callback_data import *
import requests, json
import pandas as pd
from config import get_api

import datetime

bot.add_custom_filter(asyncio_filters.StateFilter(bot))
bot.add_custom_filter(asyncio_filters.IsDigitFilter())
bot.add_custom_filter(asyncio_filters.TextMatchFilter())

# necessary for state parameter in handlers.
from telebot.states.asyncio.middleware import StateMiddleware

bot.setup_middleware(StateMiddleware(bot))

# Отправление уведомлений
async def send_notif():
    url = f'{get_api()}jams'

    try:
        jams_data = json.loads(requests.get(url).content.decode('utf-8'))
    except Exception as e:
        print(e)
        return

    if jams_data[0][1] >= 5:
        tg_ids = pd.DataFrame(data=getTg(isnotifon=True), columns=['id', 'tg_id', 'isnotifon', 'chat_id'])
        tg_ids = tg_ids.loc[:]['chat_id'].tolist()
        for usid in tg_ids:
            await bot.send_message(chat_id=usid, text=f'В ближайший час ожидаются пробки около {jams_data[0][1]} баллов!')

# Планирование уведомлений
async def scheduler():
    posting_time = ['06:00', '07:00', '08:00',
                    '09:00', '10:00', '11:00',
                    '12:00', '13:00', '14:00',
                    '15:00', '16:00', '17:00',
                    '18:00', '19:00', '20:00',
                    '21:00', '22:00']

    while True:
        if datetime.datetime.now().strftime('%H:%M') in posting_time:
            await send_notif()
        await asyncio.sleep(60)

# Рабочий процесс
def worker():
    asyncio.run((scheduler()))

# Функция запуска всех процессов
async def main():
    process = Process(target=worker)
    process.start()
    await bot.polling()
    process.join()

# Непосредственно запуск
if __name__=='__main__':
    print('bot started')
    asyncio.run(main())