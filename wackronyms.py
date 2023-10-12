import json
from player import Player, Color
from randomLetter import get_weighted_random_letter
from random import randint
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
        self.stage_counter = 0
        self.current_stage = self.stages[self.stage_counter]

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
        if len(self.prompt_list) < MAX_PROMPTS:
            self.prompt_list.append({'player': player.to_dict(), 'prompt': prompt})
    
    def advance_stage(self):
        self.stage_counter += 1
        self.current_stage = self.stages[self.stage_counter]

    @staticmethod
    def get_random_string():
        length = randint(3,6)
        if length <= 0:
            raise ValueError(f"Please provide an integer length argument of 1 or more.")
        rand_string = ''
        for i in range(length):
            letter = get_weighted_random_letter()
            rand_string += letter
        return rand_string