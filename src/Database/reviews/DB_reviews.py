import datetime

from src.Database.connection import connect

def post_reviews(datetime:datetime.datetime,
                 text:str):
    conn, cur = connect()

    if datetime is None or text is None:
        return False

    query = 'INSERT INTO private.tgreviews (datetime, text) VALUES (%s, %s);'
    data = (datetime, text)

    cur.execute(query, data)
    conn.commit()

    cur.close()
    conn.close()

    return True
