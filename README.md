# Городовёнок
![](https://img.shields.io/badge/Forum-Smolathon-green)
![](https://img.shields.io/badge/Team-НКЭиВТ-blue)
>  Современная цифровая веб-платформу для
Центра организации дорожного движения Смоленской области. Платформа
отражает социально-ориентированную миссию учреждения,
обеспечивает удобство взаимодействия с гражданами и включает
формирование единой базы данных для интеграции и расширения
функционала умной аналитики.

## Стек
![](https://img.shields.io/badge/Python_3.10-darkred)
![](https://img.shields.io/badge/sckit-moccasin)
![](https://img.shields.io/badge/pandas-moccasin)
![](https://img.shields.io/badge/flask-moccasin)
![](https://img.shields.io/badge/pytelebot-moccasin) \
![](https://img.shields.io/badge/React-firebrick)
![](https://img.shields.io/badge/JavaScript-khaki)
![](https://img.shields.io/badge/CSS-khaki)
![](https://img.shields.io/badge/графики-khaki)\
![](https://img.shields.io/badge/PostgreSQL-red)

## О нас
Мы команда энтузиастов и специалистов в области искусственного интеллекта и разработки ПО:
| Имя | GitHub | Роль | Задачи |
|-----|----|------|-------------------------|
| Кравченко Алексей | [atlaso4ek](https://github.com/ATLASO4EK "Кравченко Алексей") | Тимлид, Backend | SQL, ML, API, TG-bot |
| Христофорова Алёна | [Hao_pc](https://github.com/hao-pc "Христофорова Алёна") | Техлид, Fullstack | SQL, Data Science |
| Чайкин Арсений | [Bittjs](https://github.com/Bittjs "Чайкин Арсений") | Fullstack-разработчик | Design |
| Серикова Анастасия | [moreiwi](https://github.com/moreiwi "Серикова Анастасия") | Frontend-разработчик | Design |
| Ведерников Артём | [1Evgesha1](https://github.com/1Evgesha1 "Ведерников Артём") | Backend-разработчик | TG-bot |

## БД
### Ключевые таблицы

auth_users — таблица для аутентификации пользователей и работы с логикой разграничения прав

fines — накопительные показатели штрафов по датам

evacuation_daily — ежедневная статистика эвакуаторов

evacuation_routes — маршруты эвакуации

traffic_lights — реестр светофоров

mvd — статистика ДТП из МВД.csv

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

