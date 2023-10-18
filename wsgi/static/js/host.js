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
    var responses = data.responses;

    $("#voteStageElement").text(stage);
    $.each(responses, function(index, response) {
        var listItem = '<li>' + response + '</li>';
        $('#responseList').append(listItem);
    });
};

function transitionToReveal(data){
    console.log("Not implemented");
};

function transitionToScore(data){
    console.log("Not implemented");
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