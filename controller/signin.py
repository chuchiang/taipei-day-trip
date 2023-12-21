from flask import*
import jwt

def signin_judge(token):
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
