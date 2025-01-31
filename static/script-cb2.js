function newspage(){
    window.location.href='{{ url_for("news") }}'
}
function dashboardpage(){
    window.location.href='{{ url_for("dashboard") }}'
}
function pdfpage(){
    window.location.href='{{ url_for("summary") }}'
}
function eventspage(){
    window.location.href='{{ url_for("events") }}'
}
window.onload = function() {
    if (!document.referrer || document.referrer.includes("logout")) {
        window.location.href = "{{ url_for('home') }}";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const micButton = document.getElementById("mic-button");
    console.log("page load ho gya bsdk")

    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false; // Toggle state

    micButton.addEventListener("click", async () => {
        console.log("mic daba dia abe");
        if (!isRecording) {
            // Start recording
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                const formData = new FormData();
                formData.append("audio", audioBlob);

                // Send audio to Flask backend
                const response = await fetch("/process_audio", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();
                document.getElementById("transcription").innerText = "Transcription: " + result.text;
            };

            mediaRecorder.start();
            isRecording = true;
        } else {
            // Stop recording
            mediaRecorder.stop();
            isRecording = false;
        }
    });




});



document.addEventListener("DOMContentLoaded",async function() {
    const queryInput = document.getElementById("query-input");
    const submitButton = document.getElementById("submit-button");
    const newchatButton = document.getElementById("new-chat-button");
    const deletechatButton = document.getElementById("delete-chat-button");

    await fetchChatIds();

    newchatButton.addEventListener("click",async ()=>{
        await startNewChat();
        await displayFetchedChats();

    });

    // Function to send the input to the server
    async function sendQuery() {
        const query = queryInput.value.trim();

        if (query) {
            // Add user message bubble
            const userMessage = document.createElement("div");
            userMessage.className = "user-message";
            userMessage.textContent = query;
            document.getElementById("chat-container").appendChild(userMessage);

            // Add loading bubble
            const loadingBubble = document.createElement("div");
            loadingBubble.className = "bot-message loading";
            loadingBubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
            document.getElementById("chat-container").appendChild(loadingBubble);

            // Send the query to the server using fetch
            await fetch("/assistant", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: query }),
            })
            .then(response => response.json())
            .then(data => {
                // Remove the loading bubble
                document.getElementById("chat-container").removeChild(loadingBubble);

                // Add bot message bubble
                const botMessage = document.createElement("div");
                botMessage.className = "bot-message";
                botMessage.textContent = data.response;
                document.getElementById("chat-container").appendChild(botMessage);
                scroll_chat_to_bottom();

                // Clear the input field
                queryInput.value = "";
                fetchChatIds();
            })
            .catch(error => {
                console.error("Error:", error);
                document.getElementById("chat-container").removeChild(loadingBubble);
            });
        }

    }

    async function fetchChatIds() {
        try {
            const response = await fetch("/get_chat_ids", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (data.error) {
                console.error("Error fetching chat IDs:", data.error);
                return;
            }

            const chatIds = data.chat_ids;
            const chatNamesContainer = document.getElementById("chat-names-container");
            chatNamesContainer.innerHTML = ''; // Clear container

            chatIds.forEach(chatId => {
                create_chat_item(chatId);
            });

        } catch (error) {
            console.error("Error fetching chat IDs:", error);
        }
    }

    async function deleteChat(chatId, chatItem) {
        if (!confirm("Are you sure you want to delete this chat?")) {
            return;
        }

        try {
            const response = await fetch("/delete_chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId })
            });

            const data = await response.json();
            if (data.error) {
                console.error("Error deleting chat:", data.error);
                return;
            }

            // Remove chat item from UI
            chatItem.remove();
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    }



    function highlightSelectedChat(selectedItem) {
        // Remove 'selected' class from all chat items
        document.querySelectorAll(".chat-item").forEach(item => {
            item.classList.remove("selected");
        });

        // Add 'selected' class to the clicked item
        selectedItem.classList.add("selected");
    }

    function create_chat_item(chatId){
        const chatNamesContainer = document.getElementById("chat-names-container");
        const chatItem = document.createElement("div");
        chatItem.className = "chat-item";
        chatItem.textContent = `Chat ID: ${chatId}`;
        chatItem.setAttribute("data-chat-id", chatId);

        // Change chat ID in Flask when clicked
        chatItem.addEventListener("click",async () => {
            await changeChatId(chatId);
            highlightSelectedChat(chatItem);
            await displayFetchedChats();
        });
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "❌";
        deleteBtn.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent triggering chat selection
            deleteChat(chatId, chatItem);
        });
        chatItem.appendChild(deleteBtn);
        chatNamesContainer.appendChild(chatItem);

        return chatItem;

    }


    async function changeChatId(chatId) {
        try {
            const response = await fetch("/change_chat_id", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ chat_id: chatId }) // Send new chat ID to Flask
            });

            const data = await response.json();

            if (data.success) {
                console.log(`Chat ID changed to: ${chatId}`);
            } else {
                console.error("Error changing chat ID:", data.error);
            }
        } catch (error) {
            console.error("Error changing chat ID:", error);
        }
    }





    async function displayFetchedChats() {
        try {
            // Send a POST request to fetch the chat data (chat_id is already in the session)
            const response = await fetch("/get_chats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                console.error("Error:", data.error);
                return;
            }

            // Get the chat container
            const chatContainer = document.getElementById("chat-container");

            // Clear existing chat messages
            chatContainer.innerHTML = "";

            // Display each chat message in the container
            data.chats.forEach(chat => {
                const chatMessage = document.createElement("div");

                if (chat.sender === "user") {
                    // Display user messages
                    chatMessage.className = "user-message";
                    chatMessage.textContent = chat.message;
                } else {
                    // Display bot messages
                    chatMessage.className = "bot-message";
                    chatMessage.textContent = chat.message;
                }

                chatContainer.appendChild(chatMessage);

                scroll_chat_to_bottom();
            });

        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    }

    async function startNewChat() {
        try {
            const response = await fetch("/new_chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (data.error) {
                console.error("Error starting new chat:", data.error);
                return;
            }

            console.log("New chat started with ID:", data.chat_id);

            // Get the chat container

            var chatId= data.chat_id
            
            highlightSelectedChat(create_chat_item(chatId));

        } catch (error) {
            console.error("Error starting new chat:", error);
        }
    }

    function  scroll_chat_to_bottom(){
        const chatContainer = document.getElementById('chat-container');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }



    // Trigger the function when "Enter" is pressed (with no modifier key)
    queryInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendQuery();
            scroll_chat_to_bottom();


        }
    });

    // Trigger the function when the submit button is clicked
    submitButton.addEventListener("click", function() {
        sendQuery();
    });
});