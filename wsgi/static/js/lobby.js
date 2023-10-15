document.addEventListener("DOMContentLoaded", function() {
    var promptForm = document.getElementById("promptForm");
    var promptInput = document.getElementById("promptInput");
    var addPromptButton = document.getElementById("addPromptButton");
    var promptList = document.getElementById("promptList");

    var prompts = [];

    function addResponseModal() {
        // HTML content as a string
        var modalContent = `
            <div id="responseModal" class="modal">
                <div class="modal-content">
                    <h2>Enter Response</h2>
                    <form id="responseForm">
                        <input type="text" id="responseInput" placeholder="Submit a response">
                        <button type="button" id="submitResponseButton">Submit Response</button>
                    </form>
                </div>
            </div>
        `;
    
        // Append to the body
        document.body.insertAdjacentHTML('beforeend', modalContent);
    }

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

        // Clear screen
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Write on a fresh canvas
        var stageElement = document.createElement("div");
        stageElement.textContent = stage;
        document.body.appendChild(stageElement);

        var promptElement = document.createElement("div");
        promptElement.textContent = prompt;
        document.body.appendChild(promptElement);

        var lettersElement = document.createElement("div");
        lettersElement.textContent = letters;
        lettersElement.style.color = playerColor;
        document.body.appendChild(lettersElement);
    });

    function addPrompt(promptText) {
        var promptItem = document.createElement("div");
        promptItem.textContent = promptText;
        promptList.appendChild(promptItem);
    }

    function addResponse(responseText) {
        var responseLabel = "Your Response:"
        var responseLabelItem = document.createElement("div");
        responseLabelItem.textContent = responseLabel;
        responseLabelItem.appendChild(responseText);
        var responseItem = document.createElement("div");
        responseItem.textContent = responseText;
        responseItem.appendChild(responseText);
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

    $("#startGameButton").click(function() {
        $.get("/advance_game", function(data) {
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
                                $.post("/submit_response", { player_name: playerName, prompt: responseText }, function(data) {
                                    responseInput.value = "";
                                });
                                if (numPrompts == maxPrompts - 1){
                                    promptEntryModal.style.display = "none";
                                    startGameButton.style.display = "block";
                                }
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
    });

    
    // Show the prompt entry modal; hide start game button
    var startGameButton = document.getElementById("startGameButton");
    var promptEntryModal = document.getElementById("promptEntryModal");
    promptEntryModal.style.display = "block";
    startGameButton.style.display = "none";

    addPromptButton.addEventListener("click", function() {
        var promptText = promptInput.value.trim();
    
        if (promptText) {
            $.get("/num_prompts", function(data) {
                var numPrompts = data["num_prompts"];
                var maxPrompts = data["max_prompts"];
                console.log("Number of prompts:", numPrompts);
                console.log("Maximum prompts:", maxPrompts);
    
                if (numPrompts < maxPrompts) {
                    addPrompt(promptText);
                    prompts.push(promptText);
                    promptInput.value = "";
                    $.post("/submit_prompt", { player_name: playerName, prompt: promptText }, function(data) {
                        promptInput.value = "";
                    });
                    if (numPrompts == maxPrompts - 1){
                        promptEntryModal.style.display = "none";
                        startGameButton.style.display = "block";
                    }
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
