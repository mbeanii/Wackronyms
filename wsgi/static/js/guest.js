var promptList = [];
var responseText = ""
const stageElements = {
    "addPlayer": "addPlayerElement",
    "lobby": "lobbyElements",
    "response": "responseElements",
    "vote": "voteElements",
    "reveal": "revealElements",
    "score": "scoreElements"
};

function hideAllElements() {
    for (const stage in stageElements) {
        const elementId = stageElements[stage];
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = "none";
        }
    }
}

function showStageElements(currentStage) {
    const currentElementId = stageElements[currentStage];
    const currentElement = document.getElementById(currentElementId);
    if (currentElement) {
        currentElement.style.display = "block";
    }
}

function setStageVisibility(currentStage) {
    hideAllElements();
    showStageElements(currentStage);
}

function addPrompt(promptText) {
    var promptItem = document.createElement("div");
    promptItem.textContent = promptText;
    $("#promptList").append(promptItem);
}

function addResponse(responseText) {
    var responseLabel = "Your Response:"
    var responseLabelItem = document.createElement("div");
    responseLabelItem.textContent = responseLabel;
    $("#submittedResponse").append(responseLabelItem);

    var responseItem = document.createElement("div");
    responseItem.textContent = responseText;
    $("#submittedResponse").append(responseItem);

    $("#responseModal").hide()
}

function wordsBegintWithCorrectLetters(words, letters){
    let allMatch = true
    for(let i = 0; i < letters.length; i++) {
        if(letters[i].toLowerCase()  !== words[i][0].toLowerCase()) {
            allMatch = false;
            break; 
        }
    }
    return allMatch
}

function start_game(){
    $.get("/start_game", function() {});
}

function cleanUpScore(){
    $("#scoreStageElement").empty();
};

function transitionToResponse(data){
    cleanUpScore();

    var stage = data.stage;
    var prompt = data.prompt;
    var letters = data.letters;

    $("#stageElement").text(stage);
    $("#promptElement").text(prompt);
    $("#lettersElement").text(letters);
    $("#lettersElement").css("color", playerColor);
};

function cleanUpResponse(){
    $("#submittedResponse").empty();
    $("#firstPlayerElement").empty();
    $("#responseModal").show();
    $("#responseInput").val("");
}

function transitionToVote(data){
    cleanUpResponse();

    var stage = data.stage;
    var response_strings = data.response_strings;

    $("#voteStageElement").text(stage);
    $("#voteStageElement").css("color", playerColor);

    $("#voteStageElement").text(stage);
    $.each(response_strings, function(index, response) {
        if (response != responseText){
        var radioButton = '<label>' +
        '<input type="radio" name="responseOption" value="' + response + '">' +
            response +
           '</label><br>';
        $('#radioMenu').append(radioButton);
        };
    });
};

function cleanUpVote(){
    $("#voteStageElement").empty();
    $("#voteStageElement").show();
    $("#radioMenu").empty();
    $("#radioMenu").show();
    $("#submitVoteButton").show();
    $("#thanksForVoting").empty();
}

function transitionToReveal(data){
    cleanUpVote();
    $("#revealStageElement").text("Look at the host's screen!");
};

function cleanUpReveal(){
    $("#revealStageElement").empty();
}

function transitionToScore(data){
    cleanUpReveal();
    $("#scoreStageElement").text("Look at the host's screen!");

    if (data.is_final_round){
        $("#advanceRoundElement").hide();
        $("#finishGameElement").show();
    } else {
        $("#advanceRoundElement").show();
        $("#finishGameElement").hide();
    }
};

function togglePromptAndStartGameButtons() {
    $("#promptEntryModal").hide();
    $("#startGameElement").show();
};

function congratulateFirstPlayer() {
    $("#firstPlayerElement").text("\nCongratulations, you're first!");
}

document.addEventListener("DOMContentLoaded", function() {
    // Websocket connection
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/player');

    socket.on('connect', function() {
        console.log('WebSocket connected');
    });

    if (title == "Reconnect") {
        hideAllElements();
        $("#reconnectElement").show();
    }

    $.get("currentStage").done(function(data) {
        if (data.currentStage != "lobby") {
            setStageVisibility(data.currentStage);
        }
    });

    if (playerName) {
        console.log('Player name submitted: ' + playerName);
        setStageVisibility("lobby");
    };
      
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

    socket.on('finishGame', function() {
        hideAllElements()
        $("#gameOverElement").show();
    });

    $("#startGameButton").click(function() {
        start_game()
    });

    $("#addPromptButton").click(function() {
        var promptText = $("#promptInput").val().trim();
    
        if (promptText) {
            $.post("/submit_prompt", { prompt: promptText, player_name: playerName }, function(data) {
                var promptAdded = data["prompt_added"];
                if (promptAdded) {
                    addPrompt(promptText);
                    promptList.push(promptText);
                    $("#promptInput").val("");
                } else {
                    var message = "You can enter only " + maxPrompts + " prompts.";
                    alert(message);
                }
            })
            .fail(function() {
                console.error("Failed to retrieve data from /submit_prompt");
            });
        }
    });


    $("#submitResponseButton").click(function() {
        responseText = responseInput.value.trim();
        if (responseText) {
            $.get("/letters", function(data) {
                var letters = data["letters"];
                var words = responseText.split(" ")
                var wordCount = words.length;
                var lettersCount = letters.length

                if (wordCount == lettersCount) {
                    if (wordsBegintWithCorrectLetters(words, letters) == true) {
                        addResponse(responseText);
                        $.post("/response", { player_name: playerName, response: responseText }, function(data) {
                            responseInput.value = "";
                            if (data.isFirst) {
                                congratulateFirstPlayer();
                            }
                        });
                    } else {
                        var message = 'Each word in your response should begin with each letter in "' + letters + '"';
                        alert(message);
                    }
                } else {
                    var message = "Your response needs to be " + lettersCount + " words long.";
                    alert(message);
                }
            })
            .fail(function() {
                console.error("Failed to retrieve data from /letters");
            });
        }
    });

    $("#submitVoteButton").click(function() {
        var selectedResponse = $("input[name='responseOption']:checked").val();
        if(selectedResponse){
            $.post("/vote", {selected_response: selectedResponse, player_name: playerName}, function(){
            });
            $("#voteStageElement").hide();
            $("#radioMenu").hide();
            $("#submitVoteButton").hide();
            $("#thanksForVoting").text("Thanks for voting!");
        };
    });

    $("#advanceToScoreButton").click(function() {
        $.get("/advance_game", function(){});
    });

    $("#advanceRoundButton").click(function() {
        $.get("/advance_game", function(){});
    });

    $("#finishGameButton").click(function() {
        $.post("/finishGame", {}, function(){
        });
    });

    socket.on('hide_prompts', function() {
            togglePromptAndStartGameButtons();
    });
});