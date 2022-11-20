import json
from player import Player, Color
import randomLetter
import random
from paths import COLOR_CONFIG_PATH


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
    return [Color(colordict["name"], colordict["ansi_escape_sequence"]) for colordict in colordict_list]


class Wackronyms:
    def __init__(self):
        self.color_list = load_colors(COLOR_CONFIG_PATH)
        self.player_list = []

    def add_player(self, name):
        self.player_list.append(Player(name, self.color_list[len(self.player_list)]))

if __name__ == '__main__':
    wackronyms = Wackronyms()
    wackronyms.add_player("Brian")
    wackronyms.add_player("Grammy")
    wackronyms.add_player("Marcus")

    print(randomLetter.get_random_string(random.randint(3, 6)))
