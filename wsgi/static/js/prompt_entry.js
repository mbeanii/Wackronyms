document.addEventListener("DOMContentLoaded", function() {
    var promptForm = document.getElementById("promptForm");
    var promptInput = document.getElementById("promptInput");
    var addPromptButton = document.getElementById("addPromptButton");
    var promptList = document.getElementById("promptList");

    var prompts = [];

    // Function to add a prompt to the list
    function addPrompt(promptText) {
        var promptItem = document.createElement("div");
        promptItem.textContent = promptText;
        promptList.appendChild(promptItem);
    }

    // JavaScript code for handling the "start game" button click event
    $("#startGameButton").click(function() {
        $.get("/start_game", function(data) {
            window.location.href = "/player_round1?name=" + playerName;
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
                        // Clear the input field after submission
                        promptInput.value = "";
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
