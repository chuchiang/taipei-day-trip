
from flask import *
from model.mysql_cnx import execute_query


def attraction_db(keyword, start_index, end_index):

    if keyword == "":
        query = "SELECT * FROM attractions ORDER BY id LIMIT %s,%s;"
        values = (start_index, end_index)

    else:
        query = "SELECT * FROM attractions WHERE name LIKE %s OR mrt LIKE %s ORDER BY id LIMIT %s OFFSET %s;"
        values = (f"%{keyword}%", f"%{keyword}%", end_index, start_index)

    return execute_query(query, values)


def attraction_next_db(keyword, start_index, end_index):

    if keyword == "":
        # 判斷下一頁
        query = "SELECT * FROM attractions ORDER BY id LIMIT %s,%s;"
        values = (start_index, end_index+1)

    else:
        # 判斷下一頁
        query = "SELECT * FROM attractions WHERE name LIKE %s OR mrt LIKE %s ORDER BY id LIMIT %s OFFSET %s;"
        values = (f"%{keyword}%", f"%{keyword}%", 13, start_index)

    return execute_query(query, values)

def attraction_id_db(attractionID):
    query = "SELECT*FROM attractions WHERE id=%s;"
    values = (attractionID,)
    
    return execute_query(query, values)

