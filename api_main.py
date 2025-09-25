from src.API.private_info_handlers.handlers_post import *
from src.API.private_info_handlers.handlers_get import *
from src.API.public_info_handlers.handlers_get import *
from src.API.public_info_handlers.handlers_post import *
from src.API.public_info_handlers.handlers_put import *
from src.API.public_info_handlers.handlers_delete import *

def main():
    app.run(debug=True)

if __name__ == "__main__":
    main()