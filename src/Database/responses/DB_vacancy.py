import datetime

from src.Database.connection import connect

def post_vac_resp(full_name:str,
                  email:str,
                  phone:str,
                  job_exp:str,
                  datetime:datetime.datetime,
                  desired_vacancy:str = None,
                  add_info: str = None,
                  ischecked:bool = False):
    try:
        conn, cur = connect()

        ischecked = False if ischecked is None else ischecked
        add_info = add_info.lower() if add_info is not None else add_info   # преобразуем в нижний регистр если не пустое поле
        desired_vacancy = desired_vacancy.lower() if desired_vacancy is not None else desired_vacancy   # преобразуем в нижний регистр если не пустое поле

        data = (full_name.lower(), email.lower(), phone, job_exp.lower(), add_info, desired_vacancy, datetime, ischecked)
        query = "INSERT INTO private.job_reviews (full_name, email, phone, job_exp, add_info, desired_vacancy, datetime, ischecked) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);"
        cur.execute(query, data)
        conn.commit()

        cur.close()
        conn.close()

        return True, None
    except Exception as e:
        print(e)
        return False, e