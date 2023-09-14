from flask import *
from flask import Flask
app=Flask(__name__,static_folder='static')
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
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


@app.route("/api/attractions")
def attractions():
    try:
        # URL參數page，莫認為0
        page = int(request.args.get("page", 0))
        keyword = request.args.get("keyword", "")
        page_size = 12
        if page < 0 or page >= 5:
            error_response = {
                "error": "true",
                "message": "此頁面沒有資料"
            }
            return jsonify(error_response), 400
        start_index = page * page_size
        end_index = page_size
        if keyword =="":
            query = "SELECT * FROM attractions ORDER BY id LIMIT %s,%s;"
            values = (start_index, end_index)
            mysql_attractions_list=execute_query(query, values)
            #判斷下一頁
            query = "SELECT * FROM attractions ORDER BY id LIMIT %s,%s;"
            values = (start_index, end_index+1)
            judge_attractions_list=execute_query(query, values)
        else:
            query = "SELECT * FROM attractions WHERE name LIKE %s OR mrt LIKE %s ORDER BY id LIMIT %s,%s;"
            values = (f"%{keyword}%", f"%{keyword}%",start_index, end_index)
            mysql_attractions_list=execute_query(query, values)
    
            #判斷下一頁
            query = "SELECT * FROM attractions WHERE name LIKE %s OR mrt LIKE %s ORDER BY id LIMIT %s,%s;"
            values = (f"%{keyword}%", f"%{keyword}%",0, 13)
            judge_attractions_list = execute_query(query, values)

        attractions_list = []
        for mysql_attractions in mysql_attractions_list:
            data = {
                'id': mysql_attractions[0],
                'name': mysql_attractions[1],
                'category': mysql_attractions[2],
                'description': mysql_attractions[3],
                'address': mysql_attractions[4],
                'transport': mysql_attractions[5],
                'mrt': mysql_attractions[6],
                'lat': float(mysql_attractions[7]),
                'lng': float(mysql_attractions[8]),
                'images': mysql_attractions[9].split(',')
                }
            attractions_list.append(data)

        if len(attractions_list)==0:
            error_response = {
				"error": "true",
				"message": "沒有此景點資料"
			}
            return jsonify(error_response), 400
        
        if len(judge_attractions_list) == 13 : #判斷頁面數量13
            nextPage=page+1 
        else:
            nextPage=None
        final_data = {
            'nextPage': nextPage,
            'data': attractions_list
        }
        return Response(json.dumps(final_data,sort_keys=False), mimetype='application/json')
    except Exception as e:
        print(e)
        error_response = {
            "error": "true",
            "message": "伺服器內部錯誤"
        }
        return jsonify(error_response), 500


@app.route("/api/attraction/<attractionID>")
def attractionID(attractionID):
    try:
        query = "SELECT*FROM attractions WHERE id=%s;"
        values = (attractionID,)
        mysql_id_list = execute_query(query, values)
        id_list = []
        if len(mysql_id_list) != 0:
            for id_mysql in mysql_id_list:
                data = {
                    'id': id_mysql[0],
                    'name': id_mysql[1],
                    'category': id_mysql[2],
                    'description': id_mysql[3],
                    'address': id_mysql[4],
                    'transport': id_mysql[5],
                    'mrt': id_mysql[6],
                    'lat': float(id_mysql[7]),
                    'lng': float(id_mysql[8]),
                    'images': id_mysql[9].split(',')
                }
                id_list.append(data)
        else:
            error_response = {
                "error": "true",
                "message": "此編號沒有景點資料"
            }
            return jsonify(error_response), 400

        final_data = {
            'data': id_list
        }
        # Response json.dumps() 避免自動排序
        return Response(json.dumps(final_data,sort_keys=False), mimetype='application/json')
    except Exception as e:
        print(e)
        error_response = {
            "error": "true",
            "message": "伺服器內部錯誤"
        }
        return jsonify(error_response), 500


@app.route("/api/mrts")
def mrts():
    try:
        query = "SELECT mrt, COUNT(*) AS station_count FROM attractions GROUP BY mrt ORDER BY station_count DESC"
        values=()
        mysql_mrts_list = execute_query(query,values)
        mrts_list = []
        for mrts_mysql in mysql_mrts_list:
            data = mrts_mysql[0]
            if data:
                mrts_list.append(data)
        final_data = {
            'data': mrts_list
        }
        return jsonify(final_data)
    except Exception as e:
        print(e)
        error_response = {
            "error": "true",
            "message": "伺服器內部錯誤"
        }
        return jsonify(error_response), 500

# Pages
@app.route("/")
def index():

	return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")



app.run(host="0.0.0.0", port=3000)