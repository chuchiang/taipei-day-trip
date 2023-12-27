from flask import *
from model.mysql_cnx import execute_query


def mrt_db():
    query = "SELECT mrt, COUNT(*) AS station_count FROM attractions GROUP BY mrt ORDER BY station_count DESC"
    values = ()
    mysql_mrts_list = execute_query(query, values)
    return mysql_mrts_list