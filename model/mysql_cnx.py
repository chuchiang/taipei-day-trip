from flask import*
from mysql.connector import pooling

#建立env partner_key
import os
from dotenv import load_dotenv
load_dotenv()
user = os.getenv("user")
password = os.getenv("password")

#  創建一個連接池
cnx_pool = pooling.MySQLConnectionPool(
    user='root',
    password='2926',
    host='localhost',
    database='taipei_trip',
    pool_name='pool_name',
    buffered=True,
    pool_size=10)

# 定義一個函數來執行資料庫操作
def execute_query(query, values):
    cnx = cnx_pool.get_connection()
    cursor = cnx.cursor()
    result = None  # 初始化 result 為 None
    try:
        cursor.execute(query, values)
        cnx.commit()
        result = cursor.fetchall()
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        cnx.close()
    return result