from src.API.private_info_handlers.handlers_post import *
from src.API.private_info_handlers.handlers_get import *
from src.API.private_info_handlers.handlers_analytics import *
from src.API.private_info_handlers.handlers_tg import *
from src.API.ML_handlers.ML_handlers import *
from src.API.private_info_handlers.handlers_authorize import *
from src.API.import_export_api import *
from src.API.public_info_handlers.news_handlers import *


def main():
    app.run(host="0.0.0.0", port=8000, debug=True)

if __name__ == "__main__":
    main()