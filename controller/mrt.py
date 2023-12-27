from flask import*
from model.mysql_cnx  import execute_query
from model.mrt_mod import mrt_db
#建立Blueprint
from flask import Blueprint
mrt_api = Blueprint("mrt_api",__name__)

@mrt_api.route("/api/mrts")
def mrts():
    try:
        mysql_mrts_list = mrt_db()
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