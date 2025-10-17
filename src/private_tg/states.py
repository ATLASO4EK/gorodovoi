from telebot.asyncio_handler_backends import State, StatesGroup

class MyStates(StatesGroup):
    user_id = State()
    login = State()
    car_plate = State()
    mainmenu = State()