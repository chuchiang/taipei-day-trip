import jwt
import time
from mysql.connector import pooling
import json
from flask import *
from flask import Flask
app = Flask(__name__, static_folder='static')
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

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
        if keyword == "":
            query = "SELECT * FROM attractions ORDER BY id LIMIT %s,%s;"
            values = (start_index, end_index)
            mysql_attractions_list = execute_query(query, values)
            # 判斷下一頁
            query = "SELECT * FROM attractions ORDER BY id LIMIT %s,%s;"
            values = (start_index, end_index+1)
            judge_attractions_list = execute_query(query, values)
        else:
            query = "SELECT * FROM attractions WHERE name LIKE %s OR mrt LIKE %s ORDER BY id LIMIT %s OFFSET %s;"
            values = (f"%{keyword}%", f"%{keyword}%", end_index, start_index)
            mysql_attractions_list = execute_query(query, values)

            # 判斷下一頁
            query = "SELECT * FROM attractions WHERE name LIKE %s OR mrt LIKE %s ORDER BY id LIMIT %s OFFSET %s;"
            values = (f"%{keyword}%", f"%{keyword}%", 13, start_index)
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

        if len(attractions_list) == 0:
            error_response = {
                "error": "true",
                "message": "沒有此景點資料"
            }
            return jsonify(error_response), 400

        if len(judge_attractions_list) == 13:  # 判斷頁面數量13
            nextPage = page+1
        else:
            nextPage = None
        final_data = {
            'nextPage': nextPage,
            'data': attractions_list
        }
        return Response(json.dumps(final_data, sort_keys=False), mimetype='application/json')
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
        return Response(json.dumps(final_data, sort_keys=False), mimetype='application/json')
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
        values = ()
        mysql_mrts_list = execute_query(query, values)
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

# 註冊

@app.route("/api/user", methods=["POST"])
def user():
    try:
        data_all = request.get_json()  # 從請求中取得 JSON 資料
        signup_name = data_all["name"]
        signup_email = data_all["email"]
        signup_password = data_all["password"]
        query = "SELECT*FROM members WHERE email=%s"
        values = (signup_email,)
        email_task = execute_query(query, values)
        if len(email_task) <= 0:
            query = "INSERT INTO members(name,email,password)VALUES(%s,%s,%s);"
            values = (signup_name, signup_email, signup_password)
            execute_query(query, values)
            response = {
                "ok": "true",
            }
            return jsonify(response), 200
        else:
            error_response = {
                "error": "true",
                "message": "email已經註冊過"
            }
            return jsonify(error_response), 400

    except Exception as e:
        print(e)
        error_response = {
            "error": "true",
            "message": "伺服器內部錯誤"
        }
        return jsonify(error_response), 500


# 當前登入資訊
@app.route("/api/user/auth", methods=["PUT"])
def signin():
    try:
        data_all = request.get_json()  # 從請求中取得 JSON 資料
        signin_email = data_all["email"]
        signin_password = data_all["password"]
        query = "SELECT*FROM members WHERE email=%s and password=%s"
        values = (signin_email, signin_password)
        signin_task = execute_query(query, values)
        if len(signin_task) != 0:
            signin_data = signin_task[0]
            payload = {
                "id": signin_data[0],
                "name": signin_data[1],
                "email": signin_email,
                "password": signin_password,
                "exp":  int(time.time()) + 86400 * 7
            }
            secret = "taipei123"
            token = jwt.encode(payload, secret, algorithm='HS256')
            return jsonify({"token": token})  # 將 token 包裝成 JSON 物件
        else:
            error_response = {
                "data": "true",
                "message": "帳號或密碼錯誤"
            }
            return jsonify(error_response), 400

    except Exception as e:
        print(e)
        error_response = {
            "error": "true",
            "message": "伺服器內部錯誤"
        }
        return jsonify(error_response), 500


@app.route("/api/user/auth", methods=["GET"])
def currect():
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        payload = jwt.decode(token, 'taipei123', algorithms=['HS256'])  # 透過 JWT 機制進行解碼和驗證
        user_info = {
            'id': payload['id'],
            'name': payload['name'],
            'email': payload['email']
        }
        # print(user_info)
        return jsonify({'data': user_info}), 200
    # except jwt.ExpiredSignatureError:
    #     return jsonify({"error": "true", "message": "Token 過期"}), 401
    # except jwt.DecodeError:
    #     return jsonify({"error": "true", "message": "Token 解碼失敗"}), 401
    except Exception as e:
        print(e)
        return jsonify({"data": "null"})


def signin(token):
    try:
        # 驗證是否有登入
        if token is None:
            return jsonify({"error": "true", "message": "未登入系統，拒絕存取"}), 403
        
        token_split = token.split(' ')[1]
        payload = jwt.decode(token_split, 'taipei123', algorithms=['HS256'])  # 透過 JWT 機制進行解碼和驗證
        
        if payload is None:
            return jsonify({"error": "true", "message": "未登入系統，拒絕存取"}), 403
        
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "true", "message": "Token 過期"}), 401    

    except Exception as e:
        print(e)
        
@app.route("/api/booking", methods=["GET"])
def booking_data():
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        signin(token)

        if len(booking_data_global)!=0:
            return jsonify(booking_data_global), 200
        else:
            data_all = {
                "data": "null"
            }
            return jsonify(data_all), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "true", "message": "伺服器內部錯誤"}), 500

booking_data_global=[]#宣告一個全域的空陣列放booking資料

@app.route("/api/booking", methods=["POST"])
def booking_build():
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        signin(token)
        
        data = request.get_json() # 從資料中獲取值
        if data is not None:
            attractionId=data["attractionId"]
            date=data["date"]
            time=data["time"]
            price=data["price"]
            global booking_data_global
            query = "SELECT*FROM attractions WHERE id=%s;"
            values = (attractionId,)
            booking_attraction_data=execute_query(query, values)
            booking_data_global = []# 移除之前的預定行程
            for booking_attraction in booking_attraction_data:
                image_list = booking_attraction[9].split(',')# 以逗號切割多張圖片的網址
                datalist={
                    "data":{
                        "attraction":{
                            "id":booking_attraction[0],
                            "name": booking_attraction[1],
                            "address": booking_attraction[4],
                            "image": image_list[0],  # 取得第一張圖片的網址
                        },
                        "date":date,
                        "time":time,
                        "price":price
                    }
                }
                booking_data_global.append(datalist)
                
            return jsonify({"ok": "true"}), 200
        else:
            return jsonify({"error": "true","message":"建立失敗，輸入不正確或其他原因"}),400
    except Exception as e:
        print(e)
        return jsonify({"error": "true", "message": "伺服器內部錯誤"}), 500
    
@app.route("/api/booking",methods=["DELETE"])
def booking_delete():
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        signin(token)
        
        global booking_data_global
        
        if len(booking_data_global)!=0:
            booking_data_global = []
            return jsonify({"ok": "true"}), 403

    except Exception as e:
        print(e)
        return jsonify({"error": "true", "message": "伺服器內部錯誤"}), 500



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


app.run(host="0.0.0.0", port=3000, debug=True)

# print(app.url_map)
