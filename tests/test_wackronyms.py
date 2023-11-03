from wackronyms import Wackronyms

class TestWackronyms:

    def setup_class(self):
        self.wackronyms = Wackronyms()
        self.player1 = self.wackronyms.add_player("testPlayer1")
        self.player2 = self.wackronyms.add_player("testPlayer2")
        self.player3 = self.wackronyms.add_player("testPlayer3")
        self.prompt_string1 = "testPrompt1"
        self.prompt_string2 = "testPrompt2"
        self.prompt_string3 = "testPrompt3"
        self.wackronyms.add_prompt(self.player1, self.prompt_string1)
        self.wackronyms.add_prompt(self.player2, self.prompt_string2)
        self.wackronyms.add_prompt(self.player3, self.prompt_string3)
        self.response_string1 = "testResponse1"
        self.response_string2 = "testResponse2"
        self.response_string3 = "testResponse3"

    def test_advance_stage_rotary(self):
        assert self.wackronyms.stage_counter == 0
        assert self.wackronyms.current_round == 0
        assert self.wackronyms.current_stage == "lobby"
        self.wackronyms.start_game()

        assert self.wackronyms.stage_counter == 0
        assert self.wackronyms.current_round == 1
        assert self.wackronyms.current_stage == "response"
        self.wackronyms.advance_game()

        assert self.wackronyms.stage_counter == 1
        assert self.wackronyms.current_round == 1
        assert self.wackronyms.current_stage == "vote"
        self.wackronyms.advance_game()

        assert self.wackronyms.stage_counter == 2
        assert self.wackronyms.current_round == 1
        assert self.wackronyms.current_stage == "reveal"
        self.wackronyms.advance_game()

        assert self.wackronyms.stage_counter == 3
        assert self.wackronyms.current_round == 1
        assert self.wackronyms.current_stage == "score"
        self.wackronyms.advance_game()

        assert self.wackronyms.stage_counter == 0
        assert self.wackronyms.current_round == 2
        assert self.wackronyms.current_stage == "response"
        self.wackronyms.advance_game()

    def test_add_response(self):
        self.wackronyms.add_response(self.player1, self.response_string1)
        self.wackronyms.add_response(self.player2, self.response_string2)
        assert len(self.wackronyms.responses[self.wackronyms.current_round]) == 2

    def test_randomize_responses(self):
        self.wackronyms.advance_game()
        self.wackronyms.add_response(self.player1, self.response_string1)
        self.wackronyms.add_response(self.player2, self.response_string2)
        responses = self.wackronyms.get_response_strings_in_random_order()
        responses_set = set(responses)
        original = [response.get("response") for response in self.wackronyms.responses[self.wackronyms.current_round]]
        original_set = set(original)

        assert responses_set.issubset(original_set) and original_set.issubset(responses_set), "response not equivalent after randomization"

    def test_get_response_by_response_string(self):
        self.wackronyms.start_game()
        self.wackronyms.add_response(self.player1, self.response_string1)
        response = self.wackronyms.get_response(self.response_string1)

        assert response == {"round": 1,
                            "prompt": self.prompt_string1,
                            "player": self.player1,
                            "response": self.response_string1,
                            "isFirst": True,
                            "isWinner": False,
                            "points": 1,
                            "votes": {
                                    "players": [],
                                    "number": 0
                            }}

    def test_vote_for_response(self):
        self.wackronyms.add_response(self.player2, self.response_string2)
        response = self.wackronyms.get_response(self.response_string2)
        points_before = response["points"]
        self.wackronyms.vote_for_response(self.response_string2, self.player1.name)
        points_after = response["points"]
        votes_after = response["votes"]["number"]
        player_actual = response["votes"]["players"][0]["name"]
        assert points_after == points_before + 1
        assert votes_after == 1
        assert player_actual == self.player1.name

    def test_calculate_scores(self):
        self.wackronyms.start_game()
        self.wackronyms.add_response(self.player1, self.response_string1)
        self.wackronyms.add_response(self.player2, self.response_string2)
        self.wackronyms.add_response(self.player3, self.response_string3)
        self.wackronyms.vote_for_response(self.response_string2, self.player3.name)
        self.wackronyms.vote_for_response(self.response_string1, self.player2.name)
        self.wackronyms.vote_for_response(self.response_string2, self.player1.name)
        self.wackronyms.calculate_scores()
        
        assert self.wackronyms.responses[self.wackronyms.current_round][0]["isWinner"] == False
        assert self.wackronyms.responses[self.wackronyms.current_round][1]["isWinner"] == True
        assert self.wackronyms.responses[self.wackronyms.current_round][2]["isWinner"] == False

        assert self.wackronyms.responses[self.wackronyms.current_round][0]["isFirst"] == True
        assert self.wackronyms.responses[self.wackronyms.current_round][1]["isFirst"] == False
        assert self.wackronyms.responses[self.wackronyms.current_round][2]["isFirst"] == False

        # isFirst = 1 point; voted for winner = 2 pts; got 1 vote = 1 pt == total 4 pts
        assert self.wackronyms.responses[self.wackronyms.current_round][0]["points"] == 4
        assert self.wackronyms.responses[self.wackronyms.current_round][0]["points"] == self.wackronyms.get_player(self.player1.name).score

        # not isFirst = 0 point; voted for winner = 0 pts; got 2 votes = 2 pts == total 2 pts
        assert self.wackronyms.responses[self.wackronyms.current_round][1]["points"] == 2
        assert self.wackronyms.responses[self.wackronyms.current_round][1]["points"] == self.wackronyms.get_player(self.player2.name).score
        
        # not isFirst = 0 point; voted for winner = 2 pts; got 0 votes = 0 pts == total 2 pts
        assert self.wackronyms.responses[self.wackronyms.current_round][2]["points"] == 2
        assert self.wackronyms.responses[self.wackronyms.current_round][2]["points"] == self.wackronyms.get_player(self.player3.name).score