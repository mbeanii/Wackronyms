from numpy.random import choice

# https://funbutlearn.com/2012/06/which-english-letter-has-maximum-words.html
letters_by_word_start_frequency = {
    'S': 10.6/99.5,
    'P': 10.3/99.5,
    'C': 8.37/99.5,
    'A': 7.11/99.5,
    'U': 6.97/99.5,
    'T': 5.47/99.5,
    'M': 5.27/99.5,
    'B': 4.69/99.5,
    'D': 4.68/99.5,
    'R': 4.18/99.5,
    'H': 3.84/99.5,
    'I': 3.72/99.5,
    'E': 3.69/99.5,
    'O': 3.32/99.5,
    'F': 3.01/99.5,
    'G': 2.94/99.5,
    'N': 2.85/99.5,
    'L': 2.66/99.5,
    'W': 1.71/99.5,
    'V': 1.44/99.5,
    'K': 0.94/99.5,
    'J': 0.69/99.5,
    'Q': 0.49/99.5,
    'Z': 0.40/99.5,
    'X': 0.16/99.5
}

def get_weighted_random_letter():
    letter = choice(list(letters_by_word_start_frequency.keys()),
                    1,
                    p=list(letters_by_word_start_frequency.values()))
    return letter[0]


def get_random_string(length):
    if length <= 0:
        raise ValueError(f"Please provide an integer length argument of 1 or more.")
    rand_string = ''
    for i in range(length):
        letter = get_weighted_random_letter()
        rand_string += letter
    return rand_string


def test_weights():
    count = {}
    for i in range(10000):
        letter = str(get_weighted_random_letter())
        count[letter] = (count.get(letter, 0) + 1)
    print(count)


if __name__ == '__main__':
    test_weights()
