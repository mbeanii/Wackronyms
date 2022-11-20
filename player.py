class Color:
    """ Color Management Class """
    def __init__(self, name, ansi_escape_sequence):
        self.name = name
        self.ansi_escape_sequence = ansi_escape_sequence


class Player:
    def __init__(self, name, color):
        self.name = name
        self.color = color
