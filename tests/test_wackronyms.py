from wackronyms import Wackronyms

class TestWackronyms:

    def setup_class(self):
        self.wackronyms = Wackronyms()

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
