from flask import*
from modules.attraction_mod import attraction_db,attraction_next_db,attraction_id_db
#建立Blueprint
from flask import Blueprint
attracion_api = Blueprint("attracion_api",__name__)

@attracion_api.route("/api/attractions")
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

        mysql_attractions_list = attraction_db(keyword, start_index, end_index)
        mysql_attractions_next = attraction_next_db(keyword, start_index, end_index)
 
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

        if len(mysql_attractions_next) == 13:  # 判斷頁面數量13
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


@attracion_api.route("/api/attraction/<attractionID>")
def attractionID(attractionID):
    try:
        mysql_id_list = attraction_id_db(attractionID)
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