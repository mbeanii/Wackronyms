from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from wackronyms import Wackronyms
from player import Player
from globals import MAX_PROMPTS, NUM_ROUNDS
import logging

app = Flask(__name__, static_url_path='/wsgi/static')
socketio = SocketIO(app)
wackronyms = Wackronyms()
logging.basicConfig(level=logging.DEBUG)

class DeployStage:
    """Example use: DeployStage("response").deploy()"""

    def __init__(self, stage: str) -> None:
        deploy_function_map = {
            "response": self._deploy_response,
            "vote": self._deploy_vote,
            "reveal": self._deploy_reveal,
            "score": self._deploy_score
            }
        self.advance_function = deploy_function_map[stage]

    @staticmethod
    def _deploy_response():
        letters = wackronyms.get_random_string()
        prompt = wackronyms.get_prompt(wackronyms.current_round)
        socketio.emit('transition', {'stage': wackronyms.current_stage, 'prompt': prompt, 'letters': letters}, namespace='/host')
        socketio.emit('transition', {'stage': wackronyms.current_stage, 'prompt': prompt, 'letters': letters}, namespace='/player')

    @staticmethod
    def _deploy_vote():
        response_strings = wackronyms.get_response_strings_in_random_order()
        socketio.emit('transition', {'stage': wackronyms.current_stage, 'response_strings': response_strings}, namespace='/host')
        socketio.emit('transition', {'stage': wackronyms.current_stage, 'response_strings': response_strings}, namespace='/player')

    @staticmethod
    def _deploy_reveal():
        wackronyms.calculate_scores()
        responses = wackronyms.get_round_responses()
        prompt = wackronyms.get_prompt(wackronyms.current_round)
        socketio.emit('transition', {'stage': wackronyms.current_stage, 'responses': responses, 'prompt': prompt}, namespace='/host')
        socketio.emit('transition', {'stage': wackronyms.current_stage}, namespace='/player')

    @staticmethod
    def _deploy_score():
        responses = wackronyms.get_all_responses()
        is_final_round = wackronyms.current_round == NUM_ROUNDS
        socketio.emit('transition', {'stage': wackronyms.current_stage, 'player_list': wackronyms.serialize_player_list(), 'responses': responses}, namespace='/host')
        socketio.emit('transition', {'stage': wackronyms.current_stage, 'is_final_round': is_final_round}, namespace='/player')

    def deploy(self):
        self.advance_function()

@app.route("/", methods=["GET", "POST"])
@app.route("/player", methods=["GET", "POST"])
@app.route("/guest", methods=["GET", "POST"])
@app.route("/lobby", methods=["GET", "POST"])
def lobby():
    global wackronyms

    if request.method == "POST":
        name = request.form.get("name").strip()
        while not name:
            return render_template("guest.html", title="Add player", player=wackronyms.ghost_player, error="Come on, what's your name?")
        while name in [player.name for player in wackronyms.player_list]:
            return render_template("guest.html", title="Add player", player=wackronyms.ghost_player, error="Somebody already picked that one.")
        player = wackronyms.add_player(name)
        socketio.emit('update_list', {'player_list': wackronyms.serialize_player_list()}, namespace='/host')
        return render_template("guest.html", title="Lobby", player=player)

    return render_template("guest.html", title="Add player", player=wackronyms.ghost_player)

@app.route("/host", methods=["GET"])
def host():
    global wackronyms
    return render_template("host.html", player_names=wackronyms.serialize_player_list(), prompt_list=wackronyms.prompt_list)

@app.route("/start_game", methods=["GET"])
def start_game():
    wackronyms.start_game()
    letters = wackronyms.get_random_string()
    prompt = wackronyms.get_prompt(wackronyms.current_round)
    socketio.emit('transition', {'stage': wackronyms.current_stage, 'prompt': prompt, 'letters': letters}, namespace='/host')
    socketio.emit('transition', {'stage': wackronyms.current_stage, 'prompt': prompt, 'letters': letters}, namespace='/player')
    return "Game started"

@app.route("/advance_game", methods=["GET"])
def advance_game():
    wackronyms.advance_game()
    DeployStage(wackronyms.current_stage).deploy()
    return "Game advanced"

@socketio.on('connect', namespace='/host')
def connect_host():
    logging.debug('WebSocket client connected')

@socketio.on('connect', namespace='/player')
def connect_player():
    logging.debug('WebSocket client connected')

@app.route("/submit_prompt", methods=["POST"])
def submit_prompt():
    global wackronyms
    player_name = request.form.get("player_name")
    prompt = request.form.get("prompt")
    player = wackronyms.get_player(player_name)

    if len(wackronyms.prompt_list) < MAX_PROMPTS:
        wackronyms.add_prompt(player, prompt)
        socketio.emit('update_prompts', {'prompt_list': wackronyms.prompt_list}, namespace='/host')
    else:
        return jsonify({'prompt_added': False})
    
    if len(wackronyms.prompt_list) == MAX_PROMPTS:
        socketio.emit('hide_prompts', namespace='/player')

    return jsonify({'prompt_added': True})

@app.route("/num_prompts", methods=["GET"])
def get_num_prompts():
    global wackronyms
    data = {
        "num_prompts": len(wackronyms.prompt_list),
        "max_prompts": MAX_PROMPTS
    }
    return jsonify(data)

@app.route("/letters", methods=["GET"])
def get_letters():
    global wackronyms
    data = {
        "letters": wackronyms.letters
    }
    return jsonify(data)

@app.route("/response", methods=["POST"])
def response():
    global wackronyms
    player_name = request.form.get("player_name")
    response = request.form.get("response")
    player = wackronyms.get_player(player_name)
    if player and response:
        is_first_response = wackronyms.add_response(player, response)
        socketio.emit('playerSubmittedResponse', {"player": player.to_dict(), "isFirst": is_first_response}, namespace='/host')
        if wackronyms.all_players_in():
            advance_game()
    return jsonify({'isFirst': is_first_response})

@app.route("/vote", methods=["POST"])
def vote():
    global wackronyms
    selected_response = request.form.get("selected_response")
    player_name = request.form.get("player_name")
    wackronyms.vote_for_response(selected_response, player_name)

    num_players = len(wackronyms.player_list)
    if num_players == wackronyms.num_votes_this_round:
            advance_game()
    return jsonify({'message': 'Vote submitted'})

@app.route("/finishGame", methods=["POST"])
def finish_game():
    socketio.emit('finishGame', {}, namespace='/player')
    return jsonify({'game_ended': True})

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", debug=True)