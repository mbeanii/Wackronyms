const stageElements = {
    "lobby": "lobbyElements",
    "response": "responseElements",
    "vote": "voteElements",
    "reveal": "revealElements",
    "score": "scoreElements"
};

function setStageVisibility(currentStage) {
    // Hide all elements
    for (const stage in stageElements) {
        const elementId = stageElements[stage];
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = "none";
        }
    }
    // Show elements for the current stage
    const currentElementId = stageElements[currentStage];
    const currentElement = document.getElementById(currentElementId);
    if (currentElement) {
        currentElement.style.display = "block";
    };
};

function transitionToResponse(data){
    var stage = data.stage;
    var prompt = data.prompt;
    var letters = data.letters;

    $("#stageElement").text(stage);
    $("#promptElement").text(prompt);
    $("#lettersElement").text(letters);
};

function transitionToVote(data){
    var stage = data.stage;
    var response_strings = data.response_strings;

    $("#voteStageElement").text(stage);
    $.each(response_strings, function(index, response) {
        var listItem = '<li>' + response + '</li>';
        $('#responseList').append(listItem);
    });
};

function add_total_score_heading() {
    var headingSpan = document.createElement('div');
    headingSpan.textContent = "Total Score: ";
    headingSpan.style.color = "black";
    headingSpan.style.fontWeight = "bold";
    $("#totalScoreList").append(headingSpan);
}

function add_total_score(player, score, isWinner) {
    var scoreDiv = document.createElement('div');
    
    var playerSpan = document.createElement('span');
    playerSpan.textContent = player.name + ": ";
    playerSpan.style.color = player.color;
    scoreDiv.appendChild(playerSpan);
    
    var scoreSpan = document.createElement('span');
    scoreSpan.textContent = score;
    scoreSpan.style.color = player.color;
    scoreDiv.appendChild(scoreSpan);
    
    scoreDiv.style.fontWeight = isWinner ? "bold" : "normal";
    
    $("#totalScoreList").append(scoreDiv);
}

function add_round_heading(round) {
    var roundDiv = document.createElement('div');

    var headingSpan = document.createElement('div');
    headingSpan.textContent = "Round " + round + ": ";
    headingSpan.style.color = "black";
    headingSpan.style.fontWeight = "bold";
    roundDiv.appendChild(headingSpan);
    
    $("#scoreList").append(roundDiv);
}

function add_round_score(player, score, isWinner) {
    var scoreDiv = document.createElement('div');

    var playerSpan = document.createElement('span');
    playerSpan.textContent = player.name + ": ";
    playerSpan.style.color = player.color;
    scoreDiv.appendChild(playerSpan);
    
    var scoreSpan = document.createElement('span');
    scoreSpan.textContent = score;
    scoreSpan.style.color = player.color;
    scoreDiv.appendChild(scoreSpan);
    
    scoreDiv.style.fontWeight = isWinner ? "bold" : "normal";
    
    $("#scoreList").append(scoreDiv);
}

function add_round_scores(single_round_responses) {
    if (single_round_responses.length == 0) {
        return;
    }
    for (let i = 0; i < single_round_responses.length; i++) {
        const player = single_round_responses[i].player;
        const score = single_round_responses[i].points;
        var isWinner = i == 0;
        if (i > 0) {
            isWinner = player.score == single_round_responses[0].score;
        }
        add_round_score(player, score, isWinner);
    };
};

function add_reveal_response(player, response_string, votes, isWinner) {
    var responseDiv = document.createElement('div');
    
    var responseSpan = document.createElement('span');
    responseSpan.textContent = response_string + ": ";
    responseSpan.style.color = player.color;
    responseDiv.appendChild(responseSpan);
    
    var playerSpan = document.createElement('span');
    playerSpan.textContent = player.name;
    playerSpan.style.color = player.color;
    responseDiv.appendChild(playerSpan);
    
    if (votes.number > 0) {
        var pointsSpan = document.createElement('span');
        pointsSpan.textContent = " (" + votes.number + " votes)";
        pointsSpan.style.color = "gray";
        responseDiv.appendChild(pointsSpan);

        var votersSpan = document.createElement('span');
        var voterNames = votes.players.map(function(voter) {
            return voter.name;
        });
        votersSpan.textContent = " - voted by: " + voterNames.join(", ");
        votersSpan.style.color = "gray";
        responseDiv.appendChild(votersSpan);
    }

    responseDiv.style.fontWeight = isWinner ? "bold" : "normal";
    
    $("#revealResponseList").append(responseDiv);
};

function transitionToReveal(data) {
    var stage = data.stage;
    $("#revealStageElement").text(stage);

    // Modify the prompt element to show the prompt in black
    var promptDiv = document.createElement('div');
    promptDiv.textContent = data.prompt;
    promptDiv.style.color = "black";
    promptDiv.style.fontSize = "24px";
    promptDiv.style.fontWeight = "bold";
    $("#revealPrompt").empty().append(promptDiv);

    // Sort the responses by votes.number
    data.responses.sort(function(a, b) {
        return b.votes.number - a.votes.number;
    });

    for (let i = 0; i < data.responses.length; i++) {
        const player = data.responses[i].player;
        const response_string = data.responses[i].response;
        const votes = data.responses[i].votes;
        const isWinner = data.responses[i].isWinner;
        add_reveal_response(player, response_string, votes, isWinner);
    };
};

function splitResponsesByRound(responses) {
    roundCounter = 0
    rounds = []
    responses_for_this_round = []
    responses.sort(function(a, b) {
        return a.round - b.round;
    });
    for (let i = 0; i < responses.length; i++) {
        const round = responses[i].round;        
        console.log("Processing response:", responses[i]);
        if (round == roundCounter) {
            responses_for_this_round.push(responses[i]);
        }
        else if (round > roundCounter) {
            roundCounter = round;
            if (responses_for_this_round.length > 0){
                // Sort the responses by votes.number
                responses_for_this_round.sort(function(a, b) {
                    return b.votes.number - a.votes.number;
                });
                rounds.push(responses_for_this_round);
            }
            responses_for_this_round = [];
            responses_for_this_round.push(responses[i]);
        }
        else {
            console.log("ERROR: round number out of order");
        }
    }
    if (responses_for_this_round.length > 0){
        // Sort the responses by votes.number
        responses_for_this_round.sort(function(a, b) {
            return b.votes.number - a.votes.number;
        });
        rounds.push(responses_for_this_round);
    }
    return rounds;
};

function transitionToScore(data){
    var stage = data.stage;
    $("#scoreStageElement").text(stage);

    console.log("Responses:", data.responses);
    rounds = splitResponsesByRound(data.responses)
    console.log("Rounds:", rounds);
    
    for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];
        add_round_heading(round[0].round);
        add_round_scores(round);
    };
    
    // Sort players by score
    data.player_list.sort(function(a, b) {
        return b.score - a.score;
    });

    add_total_score_heading();
    for (let i = 0; i < data.player_list.length; i++) {
        const player = data.player_list[i];
        const score = player.score;
        var isWinner = i == 0;
        if (i > 0) {
            isWinner = player.score == data.player_list[0].score;
        }
        add_total_score(player, score, isWinner);
    };
};

// Define the function to format the player list
function formatPlayerList(data) {
  // Get the player list element
  var playerListElement = document.getElementById('playerList');

  // Clear the previous content
  playerListElement.innerHTML = '';

  // Iterate through the player list and add each player's name with their color
  data.player_list.forEach(function(player) {
      var playerSpan = document.createElement('span');
      playerSpan.textContent = player.name;
      playerSpan.style.color = player.color;
      playerSpan.className = 'player-name';
      playerListElement.appendChild(playerSpan);
  });
}

function formatPromptList(data) {
    var promptListElement = document.getElementById('promptList');
    promptListElement.innerHTML = ''; // Clear previous prompts
    data.prompt_list.forEach(function(prompt) {
        var promptElement = document.createElement('p');
        promptElement.textContent = prompt.prompt;
        promptElement.style.color = prompt.player.color;
        promptListElement.appendChild(promptElement);
    });
}

// Websocket connection
var socket = io.connect('http://' + document.domain + ':' + location.port + '/host');

socket.on('connect', function() {
    console.log('WebSocket connected');
});

socket.on('update_list', function(data) {
    console.log('Received update:', data);
    formatPlayerList(data);
});

socket.on('transition', function(data) {
        console.log(data)
        var stage = data.stage;
        setStageVisibility(stage);

        if(stage == "response"){
            transitionToResponse(data);
        } else if(stage == "vote"){
            transitionToVote(data);
        } else if(stage == "reveal"){
            transitionToReveal(data);
        } else if (stage == "score"){
            transitionToScore(data);
        }

    });

socket.on('update_prompts', function(data) {
    formatPromptList(data);
});