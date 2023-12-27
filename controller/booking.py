from flask import *
from model.booking_mod import bookind_db, booking_build_db, booking_delete_db
from controller.signin import signin_judge
from flask import Blueprint
booking_api = Blueprint("booking_api", __name__)


@booking_api.route("/api/booking", methods=["GET"])
def booking_data():
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        member_id = signin_judge(token)

        if member_id is not None:
            data_list = bookind_db(member_id)

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


@booking_api.route("/api/booking", methods=["POST"])
def booking_build():
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        member_id = signin_judge(token)

        data = request.get_json()  # 從資料中獲取值
        if data is not None:
            attractionId = int(data["attractionId"])
            date = data["date"]
            time = data["time"]
            price = data["price"]
            booking_build_db(member_id, attractionId, date, time, price)
            return jsonify({"ok": "true"}), 200
        else:
            return jsonify({"error": "true", "message": "建立失敗，輸入不正確或其他原因"}), 400
    except Exception as e:
        print(e)
        return jsonify({"error": "true", "message": "伺服器內部錯誤"}), 500


@booking_api.route("/api/booking", methods=["DELETE"])
def booking_delete():
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        member_id = signin_judge(token)
        data = request.data.decode("utf-8")  # 解碼接收的純文本數據
        if data is not None:
            booking_delete_db(data, member_id)
            return jsonify({"ok": "true"}), 403

    except Exception as e:
        print(e)
        return jsonify({"error": "true", "message": "伺服器內部錯誤"}), 500
