import player
import randomLetter
import random

def play_game():
    player_list = player.get_players(3)

    print(randomLetter.get_random_string(random.randint(3,6)))

if __name__ == '__main__':
    play_game()

