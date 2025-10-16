from src.API.private_info_analytics_handlers.import_export_api import *
from src.API.private_info_analytics_handlers.handlers_analytics import *
from src.API.private_info_analytics_handlers.handlers_mvd_stats import *
from src.API.private_info_analytics_handlers.handlers_fines_stats import *
from src.API.private_info_analytics_handlers.handlers_evacuation_stats import *

from src.API.public_info_handlers.handlers_news import *

from src.API.private_info_handlers.handlers_tg import *
from src.API.private_info_handlers.handlers_reviews import *
from src.API.private_info_handlers.handlers_authorize import *
from src.API.private_info_handlers.handlers_responses import *

from src.API.tracks_traffic_analytics.handlers_tracks_traffic import *
from src.API.tracks_traffic_analytics.handlers_detections import *
from src.API.tracks_traffic_analytics.handlers_realtime_routes import *
from src.API.tracks_traffic_analytics.handlers_clustering import *

from src.API.ML_handlers.ML_handlers import *

def main():
    app.run(host="0.0.0.0", port=8000, debug=True)

if __name__ == "__main__":
    main()