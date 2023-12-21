from flask import *
import time
from modules.member_mod import user_db, signin_db,user_email_db
import jwt
# 建立Blueprint
from flask import Blueprint
member_api = Blueprint("member_api", __name__)


@member_api.route("/api/user", methods=["POST"])
def user():
    try:
        data_all = request.get_json()  # 從請求中取得 JSON 資料
        signup_name = data_all["name"]
        signup_email = data_all["email"]
        signup_password = data_all["password"]
        email_task = user_email_db(signup_email)
        if len(email_task) <= 0:
            user_db(signup_name, signup_email, signup_password)
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
@member_api.route("/api/user/auth", methods=["PUT"])
def signin():
    try:
        data_all = request.get_json()  # 從請求中取得 JSON 資料
        signin_email = data_all["email"]
        signin_password = data_all["password"]
        signin_task = signin_db(signin_email, signin_password)
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


@member_api.route("/api/user/auth", methods=["GET"])
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
        return jsonify({'data': user_info}), 200
    # except jwt.ExpiredSignatureError:
    #     return jsonify({"error": "true", "message": "Token 過期"}), 401
    # except jwt.DecodeError:
    #     return jsonify({"error": "true", "message": "Token 解碼失敗"}), 401
    except Exception as e:
        print(e)
        return jsonify({"data": "null"})
