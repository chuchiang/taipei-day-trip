import json
import mysql.connector

with open("taipei-attractions.json", encoding="utf-8") as data_file:
    data_all = json.load(data_file)


# 建立資料庫
db = mysql.connector.connect(
    host='localhost',
    port='3306',
    user='root',
    password='2926',
    database='taipei_trip'
)
cursor = db.cursor(dictionary=True)


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
    cursor.execute(query, values)


db.commit()
cursor.close()
db.close()
