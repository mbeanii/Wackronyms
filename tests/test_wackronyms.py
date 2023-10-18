from wackronyms import Wackronyms

class TestWackronyms:

    def setup_class(self):
        self.wackronyms = Wackronyms()
        self.player1 = self.wackronyms.add_player("test1")
        self.player2 = self.wackronyms.add_player("test2")
        self.response_string1 = "testResponse1"
        self.response_string2 = "testResponse2"

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
        responses = self.wackronyms.randomize_responses()
        responses_set = set(responses)
        original = [response.get("response") for response in self.wackronyms.responses[self.wackronyms.current_round]]
        original_set = set(original)

        assert responses_set.issubset(original_set) and original_set.issubset(responses_set), "response not equivalent after randomization"

    def test_get_response_by_response_string(self):
        self.wackronyms.add_response(self.player1, self.response_string1)
        response = self.wackronyms.get_response(self.response_string1)

        assert response == {"player": self.player1,
                            "response": self.response_string1,
                            "isFirst": True,
                            "points": 1,
                            "votes": 0}

    def test_vote_for_response(self):
        self.wackronyms.add_response(self.player2, self.response_string2)
        response = self.wackronyms.get_response(self.response_string2)
        points_before = response["points"]
        self.wackronyms.vote_for_response(self.response_string2)
        points_after = response["points"]
        votes_after = response["votes"]
        assert points_after == points_before + 1
        assert votes_after == 1