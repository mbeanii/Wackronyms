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

function cleanUpScore(){
    $("#scoreStageElement").val("");
    $("#scoreList").empty();
    $("#totalScoreList").empty();
}

function transitionToResponse(data){
    cleanUpScore();
    var stage = data.stage;
    var prompt = data.prompt;
    var letters = data.letters;

    $("#stageElement").text(stage);
    $("#promptElement").text(prompt);
    $("#lettersElement").text(letters);
};

function cleanUpResponse(){
    $("#stageElement").val("");
    $("#promptElement").val("");
    $("#lettersElement").val("");
    $("#submittedPlayerList").empty();
}

function transitionToVote(data){
    cleanUpResponse();

    var stage = data.stage;
    var response_strings = data.response_strings;

    $("#voteStageElement").text(stage);
    $.each(response_strings, function(index, response) {
        var listItem = '<li>' + response + '</li>';
        $('#responseList').append(listItem);
    });
};

function cleanUpVote(){
    $("#voteStageElement").val("");
    $("#responseList").empty();
}

function createScoreTable() {
    var scoreTable = document.createElement('table');
    scoreTable.style.width = '100%';
    scoreTable.style.border = '1px solid black';
    scoreTable.style.borderCollapse = 'collapse';
    scoreTable.style.fontSize = '24px';
    scoreTable.style.fontWeight = 'bold';
    scoreTable.style.textAlign = 'center';
    scoreTable.style.margin = 'auto';
    scoreTable.style.marginTop = '10px';
    scoreTable.style.marginBottom = '10px';
    scoreTable.style.marginLeft = 'auto';
    scoreTable.style.marginRight = 'auto';
    scoreTable.style.tableLayout = 'fixed';
    scoreTable.style.wordWrap = 'break-word';
    scoreTable.style.wordBreak = 'break-all';
    scoreTable.style.whiteSpace = 'normal';
    scoreTable.style.backgroundColor = 'white';
    scoreTable.style.color = 'black';
    scoreTable.style.fontFamily = 'sans-serif';
    scoreTable.style.padding = '5px';
    scoreTable.style.borderRadius = '5px';
    scoreTable.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    scoreTable.style.display = 'block';
    scoreTable.style.overflow = 'auto';
    scoreTable.style.maxHeight = '500px';
    scoreTable.style.maxWidth = '500px';
    scoreTable.style.minWidth = '300px';
    scoreTable.style.minHeight = '300px';
    scoreTable.style.textOverflow = 'ellipsis';
    scoreTable.style.verticalAlign = 'middle';
    scoreTable.style.lineHeight = 'normal';
    scoreTable.style.position = 'relative';
    scoreTable.style.left = '0';
    scoreTable.style.right = '0';
    scoreTable.style.top = '0';
    scoreTable.style.bottom = '0';
    
    var header = scoreTable.createTHead();
    var headerRow = header.insertRow(0);
    var playerHeader = headerRow.insertCell(0);
    playerHeader.innerHTML = "Player";
    
    var isFirstHeader = headerRow.insertCell(1);
    isFirstHeader.innerHTML = "First";

    var votedForWinnerHeader = headerRow.insertCell(2);
    votedForWinnerHeader.innerHTML = "Voted for Winner";

    var numVotesHeader = headerRow.insertCell(3);
    numVotesHeader.innerHTML = "Number of Votes";

    var totalScoreHeader = headerRow.insertCell(4);
    totalScoreHeader.innerHTML = "Total Score";

    return scoreTable;
}

function insertToScoreTable(data, scoreTable) {
    var row = scoreTable.insertRow(0);

    var playerCell = row.insertCell(0);
    playerCell.innerHTML = data.player.name;
    playerCell.style.color = data.player.color;
    playerCell.style.fontWeight = data.isWinner ? "bold" : "normal";

    var isFirstCell = row.insertCell(1);
    isFirstCell.innerHTML = data.isFirst;
    isFirstCell.style.color = data.player.color;
    isFirstCell.style.fontWeight = data.isWinner ? "bold" : "normal";

    var votedForWinnerCell = row.insertCell(2);
    votedForWinnerCell.innerHTML = data.votedForWinner;
    votedForWinnerCell.style.color = data.player.color;
    votedForWinnerCell.style.fontWeight = data.isWinner ? "bold" : "normal";

    var numVotesCell = row.insertCell(3);
    numVotesCell.innerHTML = data.numVotes;
    numVotesCell.style.color = data.player.color;
    numVotesCell.style.fontWeight = data.isWinner ? "bold" : "normal";

    var totalScoreCell = row.insertCell(4);
    totalScoreCell.innerHTML = data.totalScore;
    totalScoreCell.style.color = data.player.color;
    totalScoreCell.style.fontWeight = data.isWinner ? "bold" : "normal";

    return scoreTable;
}

function add_total_score_heading() {
    
    var totScoreDiv = document.createElement('div');
    var lineBreak = document.createElement('br');
    totScoreDiv.appendChild(lineBreak);
    $("#totalScoreList").append(totScoreDiv);

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
    
    var lineBreak = document.createElement('br');
    roundDiv.appendChild(lineBreak);

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
    single_round_responses.sort(function(a, b) {
        return b.points - a.points;
    });
    scoreTable = createScoreTable();
    for (let i = 0; i < single_round_responses.length; i++) {
        var isWinner = i == 0;
        if (i > 0) {
            isWinner = player.score == single_round_responses[0].points;
        }
        single_round_responses[i].isWinner = isWinner;
    }

    // get single round responses who are winners
    var winners = single_round_responses.filter(function(response) {
        return response.isWinner;
    });

    // for each player, determine if they voted for a winner
    for (let i = 0; i < single_round_responses.length; i++) {
        const player = single_round_responses[i].player;
        const votedForWinner = winners.some(function(winner) {
            return winner.votes.players.some(function(voter) {
                return voter.name == player.name;
            });
        });
        single_round_responses[i].votedForWinner = votedForWinner;
    }

    for (let i = 0; i < single_round_responses.length; i++) {
        scoreTable = insertToScoreTable(single_round_responses[i], scoreTable)
        add_round_score(single_round_responses[i].player, single_round_responses[i].points, isWinner);
    };
    $("#scoreList").append(scoreTable);
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
        votersSpan.textContent = " - voted for by: " + voterNames.join(", ");
        votersSpan.style.color = "gray";
        responseDiv.appendChild(votersSpan);
    }

    responseDiv.style.fontWeight = isWinner ? "bold" : "normal";
    
    $("#revealResponseList").append(responseDiv);
};

function transitionToReveal(data) {
    cleanUpVote();

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

function cleanUpReveal(){
    $("#revealStageElement").val("");
    $("#revealPrompt").val("");
    $("#revealResponseList").empty();
}

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
    cleanUpReveal();

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

socket.on('playerSubmittedResponse', function(data) {
    var player_name = data.player.name;
    var player_color = data.player.color;
    var playerSpan = document.createElement('span');
    playerSpan.textContent = player_name + " submitted a response!";
    playerSpan.style.color = player_color;
    playerSpan.style.fontWeight = data.isFirst ? "bold" : "normal";
    console.log(playerSpan);
    $("#submittedPlayerList").append(playerSpan);
    var playerDiv = document.createElement('div');
    $("#submittedPlayerList").append(playerDiv);
});

window.addEventListener('beforeunload', function (e) {
    // Prompt the user with a warning message
    e.preventDefault();
    var confirmationMessage = 'Are you sure you want to leave?';
    e.returnValue = confirmationMessage;
    
    setTimeout(function() {
            if (confirm(confirmationMessage)) {
                // Handle the user leaving
            }
    }, 0);
});