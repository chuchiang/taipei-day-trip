from datetime import datetime
import random
import jwt
import time
from mysql.connector import pooling
import json
from flask import *
import requests
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
        payload = jwt.decode(token, 'taipei123', algorithms=[
                             'HS256'])  # 透過 JWT 機制進行解碼和驗證
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
        else:
            member_id = payload['id']
            return member_id

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "true", "message": "Token 過期"}), 401

    except Exception as e:
        print(e)


@app.route("/api/booking", methods=["GET"])
def booking_data():
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        member_id = signin(token)

        if member_id is not None:

            query = "SELECT booking.member_id,\
                booking.attraction_id,\
                attractions.name,\
                attractions.address,\
                attractions.images,\
                booking.date,\
                booking.time,\
                booking.price,\
                booking.id\
                FROM attractions INNER JOIN booking ON attractions.id = booking.attraction_id WHERE booking.member_id=%s;"
            values = (member_id,)
            data_list = execute_query(query, values)

        booking_data = []

        if len(data_list) != 0:
            for data in data_list:
                datalist = {
                    "data": {
                        "attraction": {
                            "id": data[1],
                            "name": data[2],
                            "address": data[3],
                            "image": data[4].split(',')[0],  # 取得第一張圖片的網址
                        },
                        "date": data[5],
                        "time": data[6],
                        "price": data[7],
                        "booking_id": data[8]
                    }
                }
                booking_data.append(datalist)
            return Response(json.dumps(booking_data, sort_keys=False), mimetype='application/json')
        else:
            data_all = {
                "data": "null"
            }
            return jsonify(data_all), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "true", "message": "伺服器內部錯誤"}), 500


@app.route("/api/booking", methods=["POST"])
def booking_build():
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        member_id = signin(token)

        data = request.get_json()  # 從資料中獲取值
        if data is not None:
            attractionId = int(data["attractionId"])

            date = data["date"]
            time = data["time"]
            price = data["price"]
            booking_query = "INSERT INTO booking(member_id,attraction_id,date,time,price)VALUES(%s,%s,%s,%s,%s);"
            booking_values = (member_id, attractionId, date, time, price)
            execute_query(booking_query, booking_values)

            return jsonify({"ok": "true"}), 200
        else:
            return jsonify({"error": "true", "message": "建立失敗，輸入不正確或其他原因"}), 400
    except Exception as e:
        print(e)
        return jsonify({"error": "true", "message": "伺服器內部錯誤"}), 500


@app.route("/api/booking", methods=["DELETE"])
def booking_delete():
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        member_id = signin(token)

        data = request.data.decode("utf-8")  # 解碼接收的純文本數據

        if data is not None:
            query = "DELETE FROM booking WHERE id=%s and member_id=%s"
            values = (data,member_id)
            execute_query(query, values)

            return jsonify({"ok": "true"}), 403

    except Exception as e:
        print(e)
        return jsonify({"error": "true", "message": "伺服器內部錯誤"}), 500


def generate_order_number():
    # 得到當前日期
    current_date = datetime.now().strftime("%Y%m%d")

    # 生成6位隨機數
    random_number = str(random.randint(100000, 999999))

    # 日期和隨機數结合為訂單
    order_number = f"{current_date}{random_number}"

    return order_number


@app.route("/api/orders", methods=["POST"])
def order():
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        member_id = signin(token)
        data = request.get_json()  # 從資料中獲取值

        if data is not None:
            order_number = generate_order_number()
            payment_status = "未付款"
            total_price = 0
            for order_data in data:
                attraction_id = order_data['data']['order']['trip']['attraction']['id']
                date = order_data['data']['order']['trip']['date']
                time = order_data['data']['order']['trip']['time']
                price = int(order_data['data']['order']['price'])
                total_price += price
                contact_name = order_data['data']['order']['contact']['name']
                contact_phone = order_data['data']['order']['contact']['phone']
                contact_email = order_data['data']['order']['contact']['email']
                order_query = "INSERT INTO orders(member_id,order_number,payment_status,attraction_id,date,time,price,contact_name,contact_phone,contact_email)VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);"
                order_values = (member_id, order_number, payment_status, attraction_id,
                                date, time, price, contact_name, contact_phone, contact_email)
                execute_query(order_query, order_values)

            prime = data[0]['data']['prime']
            name = data[0]['data']['order']['contact']['name']
            phone = data[0]['data']['order']['contact']['phone']
            email = data[0]['data']['order']['contact']['email']
            headers = {'Content-Type': 'application/json',
                       'x-api-key': 'partner_lQ2SZgPFSitR87j6zmsIJnibPPT4nK2CTREDbVRI9A5AZ8k6K07HgDVW'}
            address = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"

            json_str = {
                "prime": prime,
                "partner_key": "partner_lQ2SZgPFSitR87j6zmsIJnibPPT4nK2CTREDbVRI9A5AZ8k6K07HgDVW",
                "merchant_id": "luluching_CTBC",
                "details": "Taipei Trip Test",
                "amount": total_price,
                "cardholder": {
                    "phone_number": phone,
                    "name": name,
                    "email": email,
                    "zip_code": "",
                    "address": "",
                    "national_id": ""
                },
                "remember": False
            }

            result = requests.post(address, headers=headers, json=json_str)
            event = result.text

            event_dict = json.loads(event)  # JSON 字符串轉為 Python 字典

            if event_dict["msg"] == "Success":
                event_data = {
                    "data": {
                        "number": order_number,
                        "payment": {
                            "status": total_price,
                            "message": "付款成功"
                        }
                    }
                }
                cart_query = "DELETE FROM booking WHERE member_id=%s"
                cart_values = (member_id,)
                execute_query(cart_query, cart_values)
                event_query = "UPDATE orders SET payment_status=%s  WHERE order_number=%s;"
                event_values = ("付款成功", order_number)
                execute_query(event_query, event_values)
            else:
                event_data = {
                    "data": {
                        "number": order_number,
                        "payment": {
                            "status": total_price,
                            "message": "付款失敗"
                        }
                    }
                }
                event_query = "UPDATE orders SET payment_status=%s  WHERE order_number=%s;"
                event_values = ("付款失敗", order_number)
                execute_query(event_query, event_values)
            print(event_data)
            return Response(json.dumps(event_data, sort_keys=False), mimetype='application/json')

        else:
            error_response = {
                "error": "true",
                "message": "訂單建立失敗"
            }
        return jsonify(error_response), 500

    except Exception as e:
        print(e)
        error_response = {
            "error": "true",
            "message": "伺服器內部錯誤"
        }
    return jsonify(error_response), 500



@app.route("/api/orders/<oderNumber>", methods=["GET"])
def ordernumber(oderNumber):
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        signin(token)
        ordernumber_query='SELECT orders.order_number,\
                orders.price,\
                orders.attraction_id,\
                attractions.name,\
                attractions.address,\
                attractions.images,\
                orders.date,\
                orders.time,\
                orders.contact_name,\
                orders.contact_phone,\
                orders.contact_email\
                FROM attractions INNER JOIN orders ON attractions.id = orders.attraction_id WHERE orders.order_number=%s AND orders.payment_status="付款成功";'
        ordernumber_values=(oderNumber,)
        ordernumber_list = execute_query(ordernumber_query, ordernumber_values)

        if ordernumber_list is not None:
            orderdata_list=[]
            statustotal = 0
            for orderdata in ordernumber_list:
                status=1
                statustotal +=status
                attractionId={
                    "data": {
                        "number": orderdata[0],
                        "price": orderdata[1],
                        "trip": {
                        "attraction": {
                            "id": orderdata[2],
                            "name": orderdata[3],
                            "address": orderdata[4],
                            "image": orderdata[5].split(',')[0],
                        },
                        "date": orderdata[6],
                        "time": orderdata[7]
                        },
                        "contact": {
                        "name": orderdata[8],
                        "email": orderdata[9],
                        "phone": orderdata[10]
                        },
                        "status": statustotal
                    }
                }
                orderdata_list.append(attractionId)
            
        else:
            attractionNull={
                "data": "null"
            }
            orderdata_list.append(attractionNull)
        return Response(json.dumps(orderdata_list, sort_keys=False), mimetype='application/json')
    
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


app.run(host="0.0.0.0", port=3000, debug=True)

# print(app.url_map)
