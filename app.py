from flask import *
from flask import Flask
app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
import json
import mysql.connector

# 建立資料庫連線
db = mysql.connector.connect(
    host='localhost',
    port='3306',
    user='root',
    password='2926',
    database='taipei_trip'
)
cursor = db.cursor(dictionary=True)


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
        start_index = page * page_size+1
        end_index = start_index + page_size-1
        query = "SELECT * FROM attractions WHERE id BETWEEN %s AND %s;"
        values = (start_index, end_index)
        cursor.execute(query, values)
        mysql_attractions_list = cursor.fetchall()
        attractions_list = []
        for mysql_attractions in mysql_attractions_list:
            keyword_name = mysql_attractions['name']
            keyword_mrt = mysql_attractions['mrt']
            if len(keyword)==0:
                data = {
                    'id': mysql_attractions['id'],
                    'name': mysql_attractions['name'],
                    'category': mysql_attractions['category'],
                    'description': mysql_attractions['description'],
                    'address': mysql_attractions['address'],
                    'transport': mysql_attractions['transport'],
                    'mrt': mysql_attractions['mrt'],
                    'lat': float(mysql_attractions['lat']),
                    'lng': float(mysql_attractions['lng']),
                    'images': mysql_attractions['images'].split(',')
                }
                attractions_list.append(data)
            elif keyword in keyword_name or keyword in keyword_mrt:
                data = {
                    'id': mysql_attractions['id'],
                    'name': mysql_attractions['name'],
                    'category': mysql_attractions['category'],
                    'description': mysql_attractions['description'],
                    'address': mysql_attractions['address'],
                    'transport': mysql_attractions['transport'],
                    'mrt': mysql_attractions['mrt'],
                    'lat': float(mysql_attractions['lat']),
                    'lng': float(mysql_attractions['lng']),
                    'images': mysql_attractions['images'].split(',')
                }
                attractions_list.append(data)
        if len(attractions_list)==0:
            error_response = {
				"error": "true",
				"message": "沒有此景點資料"
			}
            return jsonify(error_response), 400
            
        final_data = {
            'nextPage': page,
            'data': attractions_list
        }
        return Response(json.dumps(final_data,sort_keys=False), mimetype='application/json')
    except Exception:
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
        cursor.execute(query, values)
        mysql_id_list = cursor.fetchall()
        id_list = []
        if len(mysql_id_list) != 0:
            for id_mysql in mysql_id_list:
                data = {
                    'id': id_mysql['id'],
                    'name': id_mysql['name'],
                    'category': id_mysql['category'],
                    'description': id_mysql['description'],
                    'address': id_mysql['address'],
                    'transport': id_mysql['transport'],
                    'mrt': id_mysql['mrt'],
                    'lat': float(id_mysql['lat']),
                    'lng': float(id_mysql['lng']),
                    'images': id_mysql['images'].split(',')
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
    except Exception:
        error_response = {
            "error": "true",
            "message": "伺服器內部錯誤"
        }
        return jsonify(error_response), 500


@app.route("/api/mrts")
def mrts():
    try:
        query = "SELECT mrt, COUNT(*) AS station_count FROM attractions GROUP BY mrt ORDER BY station_count DESC"
        cursor.execute(query)
        mysql_mrts_list = cursor.fetchall()
        mrts_list = []
        for mrts_mysql in mysql_mrts_list:
            data = mrts_mysql['mrt']
            mrts_list.append(data)
        final_data = {
            'data': mrts_list
        }
        return jsonify(final_data)
    except Exception:
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