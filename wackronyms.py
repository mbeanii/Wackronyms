import json
from player import Player, Color
from randomLetter import get_weighted_random_letter
from random import randint, shuffle
from paths import COLOR_CONFIG_PATH
from globals import MAX_PROMPTS, STAGES
from typing import List


def load_colors(path: str) -> list:
    """ Loads colors from a config

    Inputs:
        path (str): The filepath to a json config containing color data

    Outputs:
        A list of Color objects

    Raises:
        Nothing
    """
    with open(path, "r") as f:
        colordict_list = json.loads(f.read())
    return [Color(colordict["name"], colordict["ansi_escape_sequence"], colordict["hex_key"]) for colordict in colordict_list]


class Wackronyms:
    def __init__(self):
        self.color_list = load_colors(COLOR_CONFIG_PATH)
        self.player_list = []
        self.prompt_list = []
        self.stages = STAGES
        self.current_round = 0
        self.stage_counter = 0
        self.current_stage = "lobby"
        self.letters = None
        self.responses = {}
        self.num_votes_this_round = 0

    def add_player(self, name) -> Player:
        player = Player(name, self.color_list[len(self.player_list)])
        self.player_list.append(player)
        return player
    
    def serialize_player_list(self) -> List[str]:
        return [player.to_dict() for player in self.player_list]
    
    def get_player(self, name: str) -> Player:
        for player in self.player_list:
            if player.name == name:
                return player

    def get_prompt(self, index: int):
        return self.prompt_list[index].get('prompt')
    
    def add_prompt(self, player: Player, prompt: str) -> None:
        num_prompts = len(self.prompt_list)
        if num_prompts < MAX_PROMPTS:
            self.prompt_list.append({'player': player.to_dict(), 'prompt': prompt})
        else:
            raise Exception(f"Already at max number of prompts - {num_prompts}.")
    
    def advance_game(self):
        self.stage_counter += 1

        self.stage_counter = ((self.stage_counter) % len(STAGES))
        if self.stage_counter == 0:
            self.current_round += 1
            self.num_votes_this_round = 0
        
        self.current_stage = self.stages[self.stage_counter]

    def start_game(self):
        self.current_stage = self.stages[0]
        self.current_round = 1

    def get_random_string(self):
        """ Overwrites self.letters with a new random string. """
        length = randint(3,6)
        if length <= 0:
            raise ValueError(f"Please provide an integer length argument of 1 or more.")
        self.letters = ''
        for _ in range(length):
            letter = get_weighted_random_letter()
            self.letters += letter
        return self.letters
    
    def add_response(self, player: Player, response: str) -> None:
        is_first = self.current_round not in self.responses
        if self.current_round not in self.responses:
            self.responses[self.current_round] = []
        
        self.responses[self.current_round].append({"player": player,
                                                   "response": response,
                                                   "isFirst": is_first,
                                                   "points": int(is_first),
                                                   "votes": {
                                                         "players": [],
                                                         "number": 0
                                                   }})
        
    def get_response_strings_in_random_order(self) -> List[str]:
        response_string_list = []
        for response in self.responses[self.current_round]:
            response_string_list.append(response.get("response"))
        shuffle(response_string_list)
        return response_string_list
    
    def get_response(self, response_string: str) -> dict:
        for response in self.responses[self.current_round]:
            if response["response"] == response_string:
                return response
        raise Exception("Response not found")
    
    def get_responses(self) -> List[dict]:
        serialized_responses = []
        for response in self.responses[self.current_round]:
            serialized_responses.append(
                {
                    "player": response["player"].to_dict(),
                    "response": response["response"],
                    "isFirst": response["isFirst"],
                    "points": response["points"],
                    "votes": response["votes"]
                }
            )
        return serialized_responses
    
    def vote_for_response(self, selected_response: str, player_name) -> None:
        response = self.get_response(selected_response)
        response["votes"]["players"].append(self.get_player(player_name).to_dict())
        response["votes"]["number"] += 1
        response["points"] += 1
        self.num_votes_this_round += 1
    
    def all_players_in(self) -> bool:
        return (len(self.responses[self.current_round]) == len(self.player_list))