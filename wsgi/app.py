from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from wackronyms import Wackronyms
from globals import MAX_PROMPTS
import logging

app = Flask(__name__, static_url_path='/wsgi/static')
socketio = SocketIO(app)
wackronyms = Wackronyms()
logging.basicConfig(level=logging.DEBUG)

@app.route("/", methods=["GET", "POST"])
@app.route("/player", methods=["GET", "POST"])
@app.route("/lobby", methods=["GET", "POST"])
def lobby():
    global wackronyms

    if request.method == "POST":
        name = request.form.get("name").strip()
        while not name:
            return render_template("get_name_form.html", title="No Name Provided")
        player = wackronyms.add_player(name)
        socketio.emit('update_list', {'player_list': wackronyms.serialize_player_list()}, namespace='/host')
        return render_template("lobby.html", title="Lobby", player=player)

    return render_template("get_name_form.html", title="Add player")

@app.route("/player_round1", methods=["GET"])
def player_round1():
    player_name = request.args.get("name")
    player = wackronyms.get_player(player_name)

    if player is None:
        return "Player not found"

    return render_template("player_round1.html", player=player)

@app.route("/host", methods=["GET"])
def host():
    global wackronyms
    return render_template("host.html", player_names=wackronyms.serialize_player_list())

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

@app.route("/js/prompt_entry.js")
def serve_prompt_entry_js():
    return app.send_static_file("js/prompt_entry.js")

@app.route("/submit_prompt", methods=["POST"])
def submit_prompt():
    global wackronyms
    player_name = request.form.get("player_name")
    prompt = request.form.get("prompt")
    player = wackronyms.get_player(player_name)
    if player and prompt:
        wackronyms.add_prompt(player, prompt)
        socketio.emit('update_prompts', {'prompts': wackronyms.get_prompt_list()}, namespace='/host')
    return jsonify({'message': 'Prompt submitted'})

@app.route("/num_prompts", methods=["GET"])
def get_num_prompts():
    global wackronyms
    data = {
        "num_prompts": len(wackronyms.get_prompt_list()),
        "max_prompts": MAX_PROMPTS
    }
    return jsonify(data)

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", debug=True)