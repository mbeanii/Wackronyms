global_player_colors = [
    {
        "name": "Bright Blue",
        "ANSI_escape_sequence": '\033[94m',
        "is_taken": False
    },
    {
        "name": "Bright Red",
        "ANSI_escape_sequence": '\033[91m',
        "is_taken": False
    },
    {
        "name": "Bright Green",
        "ANSI_escape_sequence": '\033[92m',
        "is_taken": False
    },
    {
        "name": "Bright Cyan",
        "ANSI_escape_sequence": '\033[96m',
        "is_taken": False
    },
    {
        "name": "Bright Magenta",
        "ANSI_escape_sequence": '\033[95m',
        "is_taken": False
    },
    {
        "name": "Bright Yellow",
        "ANSI_escape_sequence": '\033[93m',
        "is_taken": False
    }
]

global_default_player_color = {
    "name": "Bright Black",
    "ANSI_escape_sequence": '\033[90m',
    "is_taken": False
}

global_end_color = '\033[0m'


class Player:
    def __init__(self, player_number, name, color):
        self.player_number = player_number
        self.name = name
        self.color = color


def assign_color():
    return_color = global_default_player_color
    for color in global_player_colors:
        if not color['is_taken']:
            color['is_taken'] = True
            return_color = color
            break
    return return_color


def create_player(player_number):
    name = input(f"Hi player {player_number}! What name would you like?\n")
    player_instance = Player(player_number, name, assign_color())
    return player_instance


def get_players(num_players):
    players = []
    for i in range(num_players):
        players.append(create_player(i+1))
        print(f'Hi, {players[i].name}')
        print(f'{players[i].color["ANSI_escape_sequence"]}You are {players[i].color["name"]}{global_end_color}')
    return players


if __name__ == '__main__':
    get_players()
