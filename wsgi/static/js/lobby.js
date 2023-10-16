var prompt_list = [];
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
            console.log("hid " + element.textContent);
        }
    }

    // Show elements for the current stage
    const currentElementId = stageElements[currentStage];
    const currentElement = document.getElementById(currentElementId);
    if (currentElement) {
        currentElement.style.display = "block";
        console.log("showed " + element.textContent);
    }
}

function addResponseModal() {
    $("#responseModal").show()
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
    console.log("hid responseModal")
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
    $.get("/start_game", function(data) {
        addResponseModal();
        $("#submitResponseButton").click(function() {
            var responseText = responseInput.value.trim();
            if (responseText) {
                $.get("/letters", function(data) {
                    var letters = data["letters"];
                    console.log("letters:", letters);
                    var words = responseText.split(" ")
                    var wordCount = words.length;
                    var lettersCount = letters.length
    
                    if (wordCount == lettersCount) {
                        if (wordsBegintWithCorrectLetters(words, letters) == true) {
                            addResponse(responseText);
                            $.post("/response", { player_name: playerName, response: responseText }, function(data) {
                                responseInput.value = "";
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
    });
}


document.addEventListener("DOMContentLoaded", function() {
    // Websocket connection
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/player');

    socket.on('connect', function() {
        console.log('WebSocket connected');
    });
      
    socket.on('transition', function(data) {
        console.log('Received update:', data);
        var stage = data.stage;
        var prompt = data.prompt;
        var letters = data.letters;

        setStageVisibility(stage)

        // Response stage
        var stageElement = document.getElementById("stageElement");
        stageElement.textContent = stage;

        var promptElement = document.getElementById("promptElement");
        promptElement.textContent = prompt;

        var lettersElement = document.getElementById("lettersElement");
        lettersElement.textContent = letters;
        lettersElement.style.color = playerColor;
    });

    $("#startGameButton").click(function() {
        start_game()
    });

    $("#addPromptButton").click(function() {
        var promptText = $("#promptInput").val().trim();
    
        if (promptText) {
            $.get("/num_prompts", function(data) {
                var numPrompts = data["num_prompts"];
                var maxPrompts = data["max_prompts"];
    
                if (numPrompts < maxPrompts) {
                    addPrompt(promptText);
                    prompt_list.push(promptText);
                    $("#promptInput").val("");
                    $.post("/submit_prompt", { player_name: playerName, prompt: promptText }, function(data) {
                        $("#promptInput").value = "";
                        if (numPrompts == maxPrompts - 1){
                            $("#promptEntryModal").hide();
                            $("#startGameElement").show();
                        }
                    });
                } else {
                    var message = "You can enter only " + maxPrompts + " prompts.";
                    alert(message);
                }
            })
            .fail(function() {
                console.error("Failed to retrieve data from /num_prompts");
            });
        }
    });
});
