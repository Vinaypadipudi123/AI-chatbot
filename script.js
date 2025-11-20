const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const chatsContainer = document.querySelector(".chats-container");
const container = document.querySelector(".container");
//API key setup
const API_KEY="AIzaSyBYMtAMUDS6KWt_7xN0Ic8uu5zHDdNCMME";
const API_URL =`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
const chatHistory=[];

const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}
// scroll
const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior:"smooth" });

const typingEffect = (text, textElement, botMsgDiv)=>{ 
    textElement.textContent = "";
    const letters = text.split("");
    let i = 0;

    const typing = setInterval(() => {
        if (i < letters.length) {
            textElement.textContent += letters[i++];
            botMsgDiv.classList.remove("loading");
            scrollToBottom();
        } else {
            clearInterval(typing);
        }
    }, 35);
}

const generateResponse= async (botMsgDiv)=>{
    const textElement = botMsgDiv.querySelector(".message-text");
   
    chatHistory.push({
        role: "user",
        parts: [{text: userMessage}]
    })

    try{
        const response = await fetch(API_URL,{
            method: "POST",
            headers:{ "content-Type": "application/json"},
            body: JSON.stringify({contents: chatHistory})
        });

        const data= await response.json();
        if(!response.ok) throw new Error(data.error.message);
        
        const responseText=data.candidates[0].content.parts[0].text
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .trim();

        typingEffect(responseText, textElement,botMsgDiv);

        // chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: responseText }]
        });

    } catch(error) {
        console.log(error);
    }
}

const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (!userMessage) return;
    promptInput.value="";

    const userMsgHTML = `<p class="message-text">${userMessage}</p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    promptInput.value = "";

    setTimeout(() => {
        const botMsgHTML = `
            <div class="bot-box">
                <img src="bot.png" class="avatar">
                <p class="message-text">Browsing my digital brain…</p>
            </div>
        `;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);
        scrollToBottom();
        generateResponse(botMsgDiv);
    }, 600);
};

promptForm.addEventListener("submit", handleFormSubmit);


// Toggle  
const themeToggleBtn = document.getElementById("theme-toggle-btn");
document.body.classList.add("dark-mode");

themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");

    if (isDark) {
        // light
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        themeToggleBtn.textContent = "light_mode";
    } else {
        // sdark
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        themeToggleBtn.textContent = "dark_mode";
    }

    //toggle animation
    themeToggleBtn.style.transition = "transform 0.3s";
    setTimeout(() => {
        themeToggleBtn.style.transform = "rotate(0deg)";
    }, 300);
});


// erase chats //
const deleteChatsBtn = document.getElementById("delete-chats-btn");

deleteChatsBtn.addEventListener("click", () => {
    chatsContainer.innerHTML = "";   
    chatHistory.length = 0;          
});
