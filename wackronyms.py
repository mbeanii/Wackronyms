import json
from player import Player, Color
import randomLetter
import random
from paths import COLOR_CONFIG_PATH
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


