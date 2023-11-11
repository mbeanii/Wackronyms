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
        self.ghost_player = Player("", self.color_list[-1])

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
        return self.prompt_list[index-1].get('prompt')
    
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
    
    def add_response(self, player: Player, response: str) -> bool:
        """ Returns whether this is the first response for the round."""
        is_first = self.current_round not in self.responses
        if self.current_round not in self.responses:
            self.responses[self.current_round] = []
        
        self.responses[self.current_round].append({"round": self.current_round,
                                                   "prompt": self.get_prompt(self.current_round),
                                                   "player": player,
                                                   "response": response,
                                                   "isFirst": is_first,
                                                   "isWinner": False,
                                                   "points": 0,
                                                   "votes": {
                                                         "players": [],
                                                         "number": 0
                                                   }})
        return is_first
        
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
    
    def get_round_responses(self, round:int=None) -> List[dict]:
        serialized_responses = []
        if not round:
            round = self.current_round
        for response in self.responses[round]:
            serialized_responses.append(
                {
                    "round": response["round"],
                    "prompt": response["prompt"],
                    "player": response["player"].to_dict(),
                    "response": response["response"],
                    "isFirst": response["isFirst"],
                    "isWinner": response["isWinner"],
                    "points": response["points"],
                    "votes": response["votes"]
                }
            )
        return serialized_responses
    
    def get_all_responses(self) -> List[dict]:
        all_responses = []
        for round in range(len(self.responses)):
            for response in self.get_round_responses(round):
                all_responses.append(response)
        return all_responses
    
    def vote_for_response(self, selected_response: str, player_name) -> None:
        response = self.get_response(selected_response)
        response["votes"]["players"].append(self.get_player(player_name).to_dict())
        response["votes"]["number"] += 1
        self.num_votes_this_round += 1

    def calculate_winners(self) -> None:
        """ Sets the isWinner flag on the winning response(s) """
        max_votes = 0
        winning_response_list = []
        for response in self.responses[self.current_round]:
            if response["votes"]["number"] >= max_votes:
                max_votes = response["votes"]["number"]
        for response in self.responses[self.current_round]:
            if response["votes"]["number"] == max_votes:
                winning_response_list.append(response)
        for response in winning_response_list:
            response["isWinner"] = True

    def get_winning_responses(self) -> List[dict]:
        winning_responses = []
        for response in self.responses[self.current_round]:
            if response["isWinner"]:
                winning_responses.append(response)
        return winning_responses
    
    def get_players_who_voted_for_the_winner(self):
        winning_responses = self.get_winning_responses()
        players_who_voted_for_the_winner = []
        
        for response in winning_responses:
            for voter in response["votes"]["players"]:
                if voter["name"] not in players_who_voted_for_the_winner:
                    players_who_voted_for_the_winner.append(voter["name"])
        return players_who_voted_for_the_winner

    def calculate_scores(self) -> None:
        """Adds two points for everyone who voted for the winner.
        Adds one point for every vote the response received.
        Adds one point to the response of the first player to submit based on the isFirst flag.
        """
        self.calculate_winners()
        players_who_voted_for_the_winner = self.get_players_who_voted_for_the_winner()

        # If player voted for the winner, their response gets two points
        for response in self.responses[self.current_round]:
            for player in players_who_voted_for_the_winner:
                if player == response["player"].name:
                    response["points"] += 2

            # Player gets one point per vote received
            response["points"] += response["votes"]["number"]

            # If player was the first to submit, their response gets one point
            if response["isFirst"]:
                response["points"] += 1

            # Save score to player object
            response["player"].score += response["points"]
    
    def all_players_in(self) -> bool:
        return (len(self.responses[self.current_round]) == len(self.player_list))