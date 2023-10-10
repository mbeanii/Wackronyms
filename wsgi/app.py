from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from wackronyms import Wackronyms
import logging

app = Flask(__name__)
socketio = SocketIO(app)
wackronyms = Wackronyms()
logging.basicConfig(level=logging.DEBUG)

@app.route("/", methods=["GET", "POST"])
@app.route("/lobby", methods=["GET", "POST"])
def lobby():
    global wackronyms

    if request.method == "POST":
        name = request.form.get("name").strip()
        while not name:
            return render_template("get_name_form.html", title="No Name Provided")
        wackronyms.add_player(name)
        socketio.emit('update_list', {'player_list': wackronyms.get_player_names()}, namespace='/host')
        return render_template("welcome.html", title="Welcome", name=name)

    return render_template("get_name_form.html", title="Add player")

@app.route("/host", methods=["GET"])
def host():
    global wackronyms
    return render_template("host.html", player_names=wackronyms.get_player_names())

@socketio.on('connect', namespace='/host')
def handle_connect():
    logging.debug('WebSocket client connected')

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", debug=True)