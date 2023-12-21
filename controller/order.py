from flask import *
from modules.order_mod import order_db,ok_delete_db,ok_update_db,false_update_db,ordernumber_db,memberorder_db
from controller.signin import signin_judge
from datetime import datetime
import random
import requests

from flask import Blueprint
order_api = Blueprint("order_api",__name__)

#建立env partner_key
import os
from dotenv import load_dotenv
load_dotenv()
partner_key = os.getenv("partner_key")

def generate_order_number():
    current_date = datetime.now().strftime("%Y%m%d")
    random_number = str(random.randint(100000, 999999))
    order_number = f"{current_date}{random_number}"
    return order_number


@order_api.route("/api/orders", methods=["POST"])
def order():
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        member_id = signin_judge(token)
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
                order_db(member_id, order_number, payment_status, attraction_id,date, time, price, contact_name, contact_phone, contact_email)

            prime = data[0]['data']['prime']
            name = data[0]['data']['order']['contact']['name']
            phone = data[0]['data']['order']['contact']['phone']
            email = data[0]['data']['order']['contact']['email']
            headers = {'Content-Type': 'application/json',
                       'x-api-key': 'partner_lQ2SZgPFSitR87j6zmsIJnibPPT4nK2CTREDbVRI9A5AZ8k6K07HgDVW'}
            address = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"

            json_str = {
                "prime": prime,
                "partner_key": partner_key,
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
                ok_delete_db(member_id)
                ok_update_db(order_number)
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
                false_update_db(order_number)
            
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



@order_api.route("/api/orders/<oderNumber>", methods=["GET"])
def ordernumber(oderNumber):
    try:
        # 驗證是否有登入
        token = request.headers.get('Authorization')
        signin_judge(token)
        ordernumber_list = ordernumber_db(oderNumber)

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

@order_api.route("/api/member/order",methods=["GET"])
def memberorder():
    try:
        #驗證是否有登入
        token = request.headers.get('Authorization')
        member_id = signin_judge(token)
        member_order=memberorder_db(member_id)

        if len(member_order) != 0:
            order_list = []
            for order_data in member_order:
                order ={
                    "data": {
                            
                            "member_order": order_data[2],
                        }
                }
                order_list.append(order)
                
            return Response(json.dumps(order_list, sort_keys=False), mimetype='application/json')

        else:
           return jsonify({"data": "null"})
    
    except Exception as e:
        print(e)
        error_response = {
            "error": "true",
            "message": "伺服器內部錯誤"
        }
    return jsonify(error_response), 500