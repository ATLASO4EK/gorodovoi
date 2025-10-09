from telebot.asyncio_handler_backends import State, StatesGroup

class MyStates(StatesGroup):
    user_id = State()
    notif_state= State()
    login = State()
    review = State()
    mainmenu = State()
    NotifState= State()