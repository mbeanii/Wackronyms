class Color:
    """ Color Management Class """
    def __init__(self, name, ansi_escape_sequence, hex_key):
        self.name = name
        self.ansi_escape_sequence = ansi_escape_sequence
        self.hex_key = hex_key


class Player:
    def __init__(self, name, color):
        self.name = name
        self.color = color
