
from flask import *

app = Flask(__name__, static_folder='static')
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True


from controller.attraction import attracion_api
app.register_blueprint(attracion_api)

from controller.mrt import mrt_api
app.register_blueprint(mrt_api)

from controller.member import member_api
app.register_blueprint(member_api)

from controller.booking import booking_api
app.register_blueprint(booking_api)

from controller.order import order_api
app.register_blueprint(order_api)



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

@app.route("/member")
def member():
    return render_template("member.html")

app.run(host="0.0.0.0", port=3000, debug=True)

# print(app.url_map)
