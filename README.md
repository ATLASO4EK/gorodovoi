# Городовёнок
![](https://img.shields.io/badge/Forum-Smolathon-green)
![](https://img.shields.io/badge/Team-НКЭиВТ-blue)
>  Современная цифровая веб-платформа для
Центра организации дорожного движения Смоленской области. Платформа
отражает социально-ориентированную миссию учреждения,
обеспечивает удобство взаимодействия с гражданами и включает
формирование единой базы данных для интеграции и расширения
функционала умной аналитики.
---
# Содержание
- [Стек](#стек)
- [О нас](#о-нас)
- [Основные ссылки](#основные-ссылки)
- [Telegramm-bot](#telegramm-bot)
  - [Описание](#описание)
  - [Функционал](#текущий-функционал-бота)
  - [Пример работы с ботом](#пример-дизайна-бота-и-работы-с-ботом)
- [БД](#бд)
  - [Ключевые таблицы](#ключевые-таблицы)
  - [Ограничения](#ограничения)
  - [Принципы хранения](#принципы-хранения)
- [API](#api)
  - [Описание](#описание-api)
  - [Документация](#документация)
---
## Основные ссылки

Ссылка на наш сайт *[тык](https://smolathon-codd.ru)*\
Скринкаст нашего сайта *[тык](https://disk.yandex.ru/i/5aENyup_3thmYA)*\
Разработанный нами брендбук *[тык](https://disk.yandex.ru/d/XjSgSAr2WKsjbw)*\
Презентация нашего проекта *[тык](https://disk.yandex.ru/d/A-PjiOeT9nbeWA)*

---
## Стек
![](https://img.shields.io/badge/Python_3.10-darkred)
![](https://img.shields.io/badge/sckit-moccasin)
![](https://img.shields.io/badge/pandas-moccasin)
![](https://img.shields.io/badge/flask-moccasin)
![](https://img.shields.io/badge/pytelebot-moccasin) \
![](https://img.shields.io/badge/React-firebrick)
![](https://img.shields.io/badge/Vite-khaki)
![](https://img.shields.io/badge/JavaScript-khaki)
![](https://img.shields.io/badge/CSS-khaki)
![](https://img.shields.io/badge/ReCharts-khaki)\
![](https://img.shields.io/badge/PostgreSQL-red)\
![](https://img.shields.io/badge/Docker-coral)
---
## О нас
Мы команда энтузиастов и специалистов в области искусственного интеллекта и разработки ПО:
| Имя | GitHub | Роль | Задачи |
|-----|----|------|-------------------------|
| Кравченко Алексей | [atlaso4ek](https://github.com/ATLASO4EK "Кравченко Алексей") | Тимлид, Backend | SQL, ML, API, TG-bot |
| Христофорова Алёна | [Hao_pc](https://github.com/hao-pc "Христофорова Алёна") | Техлид, Fullstack | SQL, Data Science, ML |
| Чайкин Арсений | [Bittjs](https://github.com/Bittjs "Чайкин Арсений") | Frontend-разработчик | React, Figma |
| Серикова Анастасия | [moreiwi](https://github.com/moreiwi "Серикова Анастасия") | Frontend-разработчик | 	Figma, Photoshop |
| Ведерников Артём | [1Evgesha1](https://github.com/1Evgesha1 "Ведерников Артём") | Backend-разработчик | TG-bot, ML |

---
## Telegramm-bot
### Описание
Нами был разработан телеграмм-бот, как еще один интерфейс 
взаимодействия с платформой для простых пользователей, 
но с возможностью расширения и для администрирования платформой, а также редакцией раздела новостей.\
Бот был разработан для повышения качества опыта работы с платформой простых пользователей (в планах и администраторов)\

### Текущий функционал бота:
- Включение\отключение оповещений о пробках
- Просмотр прогноза пробок
- Просмотр последних 2 новостей от ЦОДД Смоленской области
- Сбор отзывов о платформе ЦОДД Смоленской области

### Пример дизайна бота и работы с ботом:
[![image.png](https://i.postimg.cc/P5FhC8Yc/image.png)](https://postimg.cc/21vgJyHF)\
[![image.png](https://i.postimg.cc/G2Cftc7J/image.png)](https://postimg.cc/LqxD0MMn)\
[![image.png](https://i.postimg.cc/L8gQVqGC/image.png)](https://postimg.cc/4YZ1f3fV)\
[![image.png](https://i.postimg.cc/wBd2cwXy/image.png)](https://postimg.cc/VJDXzBHm)\
[![image.png](https://i.postimg.cc/8kFyGfP2/image.png)](https://postimg.cc/Th6jqwb0)
---
## БД
### Ключевые таблицы
Схема city_ops:
- auth_users — таблица для аутентификации пользователей и работы с логикой разграничения прав 
- fines — накопительные показатели штрафов по датам 
- evacuation_daily — ежедневная статистика эвакуаторов 
- evacuation_routes — маршруты эвакуации 
- traffic_lights — реестр светофоров 
- mvd — статистика ДТП из МВД.csv

Схема private:
- tgusers - таблица с данными пользователей тг бота

Схема public:
- news - таблица со всеми новостями

### Ограничения
CHECK на неотрицательные значения,

UNIQUE по ключевым бизнес-атрибутам,

внешних ключей нет

### Принципы хранения
данные загружаются пачками из Excel/CSV через Python (pandas + SQLAlchemy),

вставка идемпотентная (UPSERT по ключам),

все таблицы в отдельной схеме city_ops

```mermaid
erDiagram
   auth_users {
    bigint id
    timestamptz created_at
    text name
    text email
    text role "admin|editor|user"
    text api_key_prefix
    boolean is_active
    timestamptz last_login_at
  }
    fines {
      bigint id
      date report_date
      int cams_violations_cum
      int decisions_cum
      numeric fines_sum_cum
      numeric collected_sum_cum
    }

    evacuation_daily {
      date event_date
      int tow_trucks_on_line
      int trips_count
      int evacuations_count
      numeric impound_revenue_rub
    }

    evacuation_routes {
      bigint id
      int year
      smallint month_num
      text month_name_ru
      text route
    }

    traffic_lights {
      bigint id
      int registry_no
      text address
      text signal_type
      int installation_year
    }

    mvd {
      bigint id
      text region
      text period_label
      date period_start
      date period_end
      int crashes_with_victims
      int deaths
      int injuries
      numeric deaths_per_100_victims
    }
```
---
## API
### Описание API
Для повышения модульности проекта и дальнейшей его 
масштабируемости нами было разработано API для связи БД, Backend'а и Frontend'а.

### Документация

Раздел /api/v1/

`jams`
- GET `jams`\
_**Принимает**_:\
_**Возвращает**_:\
массив, содержащий информацию о предсказываемых пробках в текущий и ближайшие 3 часа в формате [[час, баллы], [час, баллы], [час, баллы], [час, баллы]]

`analytics`
- GET `analytics`\
_**Принимает**_:\
table - string, название таблицы из которой будут взяты данные, 'fines' или 'evacuate'\
date_start - string, дата начала периода в формате 'YYYY-MM-DD', опционально\
date_end - string, дата конца периода в формате 'YYYY-MM-DD', опционально\
_**Возвращает**_:\
словарь (Dictionary), содержащий проанализированную информацию из таблицы за выбранный период (опционально) или за все имеющиеся данные в таблице в формате:\
{'sum_trip':sum_trip, 'sum_evac':sum_evac,
'sum_rev':sum_rev, 'per_evac':per_evac, 'avg_rev':avg_rev} \
или \
{'sum_cam':sum_cam, 'sum_des':sum_des, 'sum_fin':sum_fin,
'sum_col':sum_col, 'per_col':per_col,
'per_cam_right':per_cam_right, 'avg_fin_des':avg_fin_des}

`auth`
- GET `auth`\
_**Принимает**_:\
site - string, строка содержащая раздел, в который нужно авторизоваться, 'news' или 'analytics'\
code - string, ключ, введенный пользователем\
_**Возвращает**_:\
True - если пользователь ввел верные данные\
False - если пользователь ввел неверные данные

`EvacuationStats`
- GET `EvacuationStats`\
_**Принимает**_:\
date - string, дата начала периода в формате 'YYYY-MM-DD', опционально\
_**Возвращает**_:\
Возвращает данные из БД с указанными в запросе фильтрами


- POST `EvacuationStats`\
_**Принимает**_:\
date - string, дата начала периода в формате 'YYYY-MM-DD', опционально\
trucks_num  - integer, количество машин на линии\
trips_num - integer, количество выездов\
evac_num - integer, количество эвакуаций\
rev_rub - float, прибыль штраф стоянки\
_**Возвращает**_:


- PUT `EvacuationStats`\
_**Принимает**_:\
_**Возвращает**_:


- DELETE `EvacuationStats`\
_**Принимает**_:\
_**Возвращает**_:

`MVDStats`
- GET `MVDStats`\
_**Принимает**_:\
date - string, дата в формате 'YYYY-MM-DD', опционально\
_**Возвращает**_:\
Возвращает данные из БД с указанными в запросе фильтрами


- POST `MVDStats`\
_**Принимает**_:\
date_start - string, дата начала периода в формате 'YYYY-MM-DD', опционально\
date_end - string, дата конца периода в формате 'YYYY-MM-DD', опционально\
period_text - string, текстовое описание периода (необязательное)\
region - string, текстовое описание региона (необязательное)\
crashes - integer, количество аварий\
deaths = integer, количество смертей\
injuries = integer, количество смертей\
_**Возвращает**_:


- PUT `MVDStats`\
_**Принимает**_:\
_**Возвращает**_:


- DELETE `MVDStats`\
_**Принимает**_:\
_**Возвращает**_:

`FinesStats`
- GET `FinesStats`\
_**Принимает**_:\
date - string, дата в формате 'YYYY-MM-DD', опционально\
_**Возвращает**_:\
Возвращает данные из БД с указанными в запросе фильтрами


- POST `FinesStats`\
_**Принимает**_:\
date - string, дата в формате 'YYYY-MM-DD', опционально\
cam_vial - integer, количество штрафов, выписанными камерами\
decisions - integer, количество подтвержденных штрафов от камер\
fines_sum - float, назначенная сумма штрафов\
collected_sum - float, полученная сумма штрафов\
_**Возвращает**_:


- PUT `FinesStats`\
_**Принимает**_:\
_**Возвращает**_:


- DELETE `FinesStats`\
_**Принимает**_:\
_**Возвращает**_:

`tg`
- GET `tg`\
_**Принимает**_:\
id_int - integer, id в БД (опционально)\
tg_id - integer, telegramm-id пользователя (опционально)\
isnotifon - boolean, включены ли уведомления (опционально)\
_**Возвращает**_:\
Возвращает данные из БД с указанными в запросе фильтрами


- POST `tg`\
_**Принимает**_:\
tg_id - integer, telegramm-id пользователя\
isnotifon - boolean, включены ли уведомления\
_**Возвращает**_:


- PUT `tg`\
_**Принимает**_:\
tg_id - integer, telegramm-id пользователя\
isnotifon - boolean, включены ли уведомления\
_**Возвращает**_:

`reviews`
- POST `reviews`\
_**Принимает**_:\
text - str, текст отзыва\
_**Возвращает**_:\
True, если успешно, или exception, если возникла ошибка

`News`
- GET `News`\
_**Принимает**_:\
filters - string, какой формат новостей нужен (опционально), 'tg' - две последние новости, 'last' - четыре последние новости, если отсутствует, то выводит все новости\
_**Возвращает**_:\
Возвращает данные из БД о новостях в массиве [[id, время, автор, заголовок, короткий текст, полный текст, картинка]]


- POST `News`\
_**Принимает**_:\
author - string, автор новости\
header - string, заголовок новости\
short_text - string, короткий текст новости\
full_text - string, полный текст новости\
image - string, картинка (ссылка)\
_**Возвращает**_:


- PUT `News`\
_**Принимает**_:\
id_int - integer, id новости в БД\
author - string, автор новости\
header - string, заголовок новости\
short_text - string, короткий текст новости\
full_text - string, полный текст новости\
image - string, картинка (ссылка)\
_**Возвращает**_:


- DELETE `News`\
_**Принимает**_:\
id_int - integer, id в БД\
_**Возвращает**_:

`vacancy_resp`
- POST `vacancy_resp`\
_**Принимает**_:\
full_name = string, ФИО\
email = string, email\
phone = string, номер телефона\
job_exp = string, описание опыта работы\
desired_vacancy = string, желаемая должность (опционально)\
add_info = string, дополнительная информация/сопроводительное письмо (опционально)\
ischecked = bool, проверенно ли человеком заявление (опционально, по умолчанию - False)\
_**Возвращает**_:

`service_resp`
- POST `service_resp`\
_**Принимает**_:\
full_name = string, ФИО\
email = string, email\
phone = string, номер телефона\
service = string, услуга\
add_info = string, дополнительная информация/сопроводительное письмо (опционально)\
ischecked = bool, проверенно ли человеком заявление (опционально, по умолчанию - False)\
_**Возвращает**_: