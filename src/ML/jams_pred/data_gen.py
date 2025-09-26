import pandas as pd
import datetime
import faker
import numpy as np
from random import randint

fake = faker.Faker()

holidays = ['12-31','1-1','5-9','2-23','3-8','5-1','5-2','5-3','6-12','6-13'] # Основные праздники
workweekdays = [x for x in range(2, 7)] # Рабочие дни
rushhours = [7,8,9,17,18,19] # Час-пик
unrushhours = [0,1,2,3,4,5,6,11,14,23] # Сон-час
data = []

for i in range(2500):
    k = 1.0
    date = fake.date_time_ad(start_datetime=datetime.date(2025, 1,1), end_datetime=datetime.date(2025,12,31))
    weekday = date.weekday()
    weekday_out = np.eye(7)[weekday]
    rest_day = 0
    m_d = f'{date.month}-{date.day}'
    holiday = 0
    # Проверяем на выходной
    if m_d in holidays:
        rest_day = 1
        holiday = 1
    if weekday == 7 or weekday == 1:
        rest_day = 1

    # Если конец недели коэф-т пробок выше
    if weekday == 6 or weekday == 7 or weekday == 1:
        k+=0.1

    # Если час-пик и выходной или рабочий день коэф-т выше
    if date.hour in rushhours:
        k+=0.3

    #Если сон-час коэф-т значительно ниже
    if date.hour in unrushhours:
        k-=0.4

    label = round(randint(1, 7)*k)/10

    data.append([date.hour/23, weekday_out[0], weekday_out[1], weekday_out[2],
                weekday_out[3], weekday_out[4], weekday_out[5], weekday_out[6], holiday, label])

df = pd.DataFrame(columns=['hour', 'isMonday', 'isTuesday', 'isWednesday',
                           'isThursday', 'isFriday', 'isSaturday', 'isSunday',
                           'holiday', 'label'], data=data)

df.to_csv('jams_data.csv', index = False)