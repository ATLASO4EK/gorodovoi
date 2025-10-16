import datetime

from src.Database.connection import connect

def post_service_resp(full_name: str,
                      email: str,
                      phone: str,
                      service: str,
                      datetime:datetime.datetime,
                      add_info: str = None,
                      ischecked:bool = False) -> bool or Exception:
    try:
        conn, cur = connect()

        ischecked = False if ischecked is None else ischecked
        add_info = add_info.lower() if add_info is not None else add_info  # преобразуем в нижний регистр если не пустое поле

        data = (full_name.lower(), email.lower(), phone.lower(), service.lower(), add_info, datetime, ischecked)
        query = "INSERT INTO private.service_orders (full_name, email, phone, service, add_info, datetime, ischecked) VALUES (%s, %s, %s, %s, %s, %s, %s);"
        cur.execute(query, data)
        conn.commit()

        cur.close()
        conn.close()

        return True, None
    except Exception as e:
        print(e)
        return False, e