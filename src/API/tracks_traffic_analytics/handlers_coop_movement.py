from src.API.app import app
from flask import  request, jsonify
import pandas as pd

from src.Database.trucks_traffic.DB_cars_detections import get_detections
from src.Database.trucks_traffic.DB_realtime_routes import get_routes

def get_common_detectors_count(target_route: str, candidate_route: str) -> int:
    target_detectors = set(target_route.split(','))
    candidate_detectors = set(candidate_route.split(','))
    return len(target_detectors & candidate_detectors)



def get_matching_routes(target_route:str,
                        all_routes:pd.DataFrame,
                        min_nodes:int=1) -> list:
    # Параметры анализа
    MIN_COMMON_NODES = min_nodes  # Минимальное количество последовательно совпадающих узлов

    target_nodes = target_route.split(',')
    matching_vehicles = []

    for _, row in all_routes.iterrows():
        candidate_nodes = row['route'].split(',')

        # Поиск общих узлов с проверкой последовательности
        common_segments = []
        i, j = 0, 0

        while i < len(target_nodes) and j < len(candidate_nodes):
            if target_nodes[i] == candidate_nodes[j]:
                # Найден общий узел - проверяем длину последовательности
                segment_length = 1
                ti, tj = i + 1, j + 1

                # Проверяем последующие узлы
                while (ti < len(target_nodes) and
                       tj < len(candidate_nodes) and
                       target_nodes[ti] == candidate_nodes[tj]):
                    segment_length += 1
                    ti += 1
                    tj += 1

                if segment_length >= MIN_COMMON_NODES:
                    common_segments.append(segment_length)

                i, j = ti, tj
            elif i < j:
                i += 1
            else:
                j += 1

        # Если найдены подходящие сегменты
        if common_segments and max(common_segments) >= MIN_COMMON_NODES:
            matching_vehicles.append(row['identificator'])
    return matching_vehicles

@app.route('/api/v1/tracks_traffic/coop_analytics', methods=['GET'])
def coop_analytics_api():
    try:
        identificator = str(request.args.get('identificator'))
        min_nodes = int(request.args.get('min_nodes')) if request.args.get('min_nodes') is not None else 1
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    try:
        # Получение маршрута цели
        target_route = get_routes(identificator=identificator)[1][0][2]

        # Все маршруты
        all_routes = pd.DataFrame(data=get_routes()[1], columns=['id', 'identificator', 'route'])
        all_routes = all_routes[all_routes['route'] != target_route]

        # Подходящие маршруты
        matching_ids = get_matching_routes(target_route=target_route,
                                           all_routes=all_routes,
                                           min_nodes=min_nodes)

        matched_routes = all_routes[all_routes['identificator'].isin(matching_ids)]

        # Посчитаем общие узлы
        count_detectors = {
            row['identificator']: get_common_detectors_count(target_route, row['route'])
            for _, row in matched_routes.iterrows()
        }

        # Получаем все детекции
        detections = pd.DataFrame(get_detections()[1],
                                  columns=['id', 'detector', 'labeltime', 'identificator', 'speedtime'])
        detections['labeltime'] = pd.to_datetime(detections['labeltime'])

        # Оставляем только те, кто в matching_ids
        detections = detections[detections['identificator'].isin(matching_ids)]

        # Считаем временной промежуток (в секундах) для каждого matching идентификатора
        time_spent = {}
        for vehicle_id in matching_ids:
            vehicle_detections = detections[detections['identificator'] == vehicle_id]
            if not vehicle_detections.empty:
                start_ts = vehicle_detections['labeltime'].min()
                end_ts = vehicle_detections['labeltime'].max()
                time_spent[vehicle_id] = (end_ts - start_ts).total_seconds()
            else:
                time_spent[vehicle_id] = None  # если нет данных

        return jsonify({
            'count_detectors': count_detectors,
            'matching_identificators': matching_ids,
            'time_spent_seconds': time_spent
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


print()