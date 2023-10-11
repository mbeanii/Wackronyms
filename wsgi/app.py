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
        return render_template("lobby.html", title="Lobby", name=name)

    return render_template("get_name_form.html", title="Add player")

@app.route("/player_round1", methods=["GET"])
def player_round1():
    return render_template("player_round1.html")

@app.route("/host", methods=["GET"])
def host():
    global wackronyms
    return render_template("host.html", player_names=wackronyms.get_player_names())

@app.route("/host_round1", methods=["GET"])
def host_round1():
    return render_template("host_round1.html")

@app.route("/start_game", methods=["GET"])
def start_game():
    socketio.emit('reroute', {'url': "/host_round1"}, namespace='/host')
    return jsonify({'message': 'Game started'})

@socketio.on('connect', namespace='/host')
def handle_connect():
    logging.debug('WebSocket client connected')

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", debug=True)