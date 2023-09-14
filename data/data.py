import json
from mysql.connector import pooling


#  創建一個連接池
cnx_pool = pooling.MySQLConnectionPool(
    user='root', 
    password='2926', 
    host='localhost', 
    database='taipei_trip', 
    pool_name='pool_name', 
    buffered= True, 
    pool_size=10)

#定義一個函數來執行資料庫操作
def execute_query(query,values):
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


with open("taipei-attractions.json", encoding="utf-8") as data_file:
    data_all = json.load(data_file)

# for data in data_all["result"]["results"]:  # 疊代 "results" 列表中的每個字典
#     name = data['name']
#     query = "SELECT mrt FROM attractions WHERE name=%s"
#     values = (name,)
#     result1=execute_query(query, values)
#     # print(result1)


# ==========attractions table 資料庫創建==========
for data in data_all["result"]["results"]:  # 疊代 "results" 列表中的每個字典
    name = data['name']
    category = data['CAT']
    description = data['description']
    address = data['address']
    transport = data['direction']
    mrt = data['MRT']
    lat = data['latitude']
    lng = data['longitude']
    image_urls = data['file'].split("https:")
    checkFile = (".jpg", ".png", ".JPG", ".PNG")
    # endswith 可以傳入tuple(())
    jpg_urls = ["https:"+url for url in image_urls if url.endswith(checkFile)]
    images = ",".join(jpg_urls)
    query = "INSERT INTO attractions (name,category,description,address,transport,mrt,lat,lng,images) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)"
    values = (name, category, description, address,
              transport, mrt, lat, lng, images)
    execute_query(query, values)


# ==========mrts table 資料庫創建==========
# 使用集合來存儲唯一的 mrt 值
# unique_mrts = set()
# for data in data_all["result"]["results"]:
#     mrt = data.get('MRT')  # 使用 get 方法來防止 None 值引起的錯誤
#     if mrt:
#         unique_mrts.add(mrt)

# # 將唯一的 mrt 值插入到 MySQL 資料庫中
# for mrt in unique_mrts:
#     query = "INSERT INTO mrts (name) VALUES (%s)"
#     values = (mrt,)
#     execute_query(query, values)

#================將attractions table中mrtID與mrt table 的mrt名稱相同者改以ID表示==========
# query = "SELECT * FROM mrts"
# values = ()
# mrt_dict = execute_query(query, values)
# print=(mrt_dict)




# # ==========img table 資料庫創建==========
# for img in data_all["result"]["results"]:
#     image_urls = img['file'].split("https:")
#     checkFile = (".jpg", ".png", ".JPG", ".PNG")
#     #endswith 可以傳入tuple(())
#     jpg_urls = ["https:"+url for url in image_urls if url.endswith(checkFile)]
#     for all_jpg in jpg_urls:
#         jpg=all_jpg
#     query = "INSERT INTO mrts (name) VALUES (%s)"
#     values = (jpg,)
#     execute_query(query, values)
