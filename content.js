let selectEnabled = false;
let pinList = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received: ", message);

    if (message.action === "activateMode") {
        if (!selectEnabled) {
            console.log("Select enabled");
            selectEnabled = true;
            activateLogger();

            showPopup("Select mode activated!");

            sendResponse({ status: "Select enabled" });
        }
    }
    else if (message.action === "deactivateMode") {
        if (selectEnabled) {
            console.log("Select deactivated");
            selectEnabled = false;
            disableLogger();

            hidePopup();

            sendResponse({ status: "Select deactivated" });

            pinList = [];
        }
    }

    return true;
});

function activateLogger() {
    const container = document.querySelector(".masonryContainer");
    if (!container) {
        console.error("Container not found");
        return;
    }

    pinClickHandler = function (event) {
        let pinElement = event.target.closest(`div[data-test-id="pin"]`);

        if (pinElement) {
            event.preventDefault();

            const pinID = pinElement.getAttribute("data-test-pin-id") || "No ID";
            const imgUrl = pinElement.querySelector("img")?.src || "No img url";

            pinList.push(pinID);

            console.log("Pin clicked");
            console.log("Pin ID: ", pinID);
            console.log("Pin Img Url: ", imgUrl);

            event.stopPropagation();
        }
    };

    container.addEventListener("click", pinClickHandler, true);
}

function disableLogger() {
    const container = document.querySelector(".masonryContainer");
    if (container && pinClickHandler) {
        console.log("Removing event listener");
        container.removeEventListener("click", pinClickHandler, true);
        pinClickHandler = null;
    }
}

function showPopup(message) {
    let popupElement = document.getElementById("popup");

    if (!popupElement) {
        const container = document.querySelector(".masonryContainer");
        let popup = document.createElement("div");
        let popupDisplay = document.createElement("div");

        popup.appendChild(popupDisplay);

        popup.id = "popup-div";
        popup.style.position = "fixed";
        popup.style.bottom = "20px";
        popup.style.left = "50%";
        popup.style.zIndex = "99999"; 
        popup.style.display = "flex";
        popup.style.justifyContent = "center";
        popup.style.width = "auto"; 
        popup.style.height = "60px";

        popupDisplay.id = "popup-display";
        popupDisplay.style.display = "flex";
        popupDisplay.style.alignItems = "center";
        popupDisplay.style.justifyContent = "center";
        popupDisplay.style.backgroundColor = "#00ff00";
        popupDisplay.style.height = "30px";
        popupDisplay.style.color = "#000";
        popupDisplay.style.padding = "10px 20px";
        popupDisplay.style.border = "1px solid #ccc";
        popupDisplay.style.borderRadius = "8px";
        popupDisplay.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
        popupDisplay.textContent = message;

        if (container) {
            container.appendChild(popup);
        } else {
            document.body.appendChild(popup); 
        }
    }
}

function hidePopup() {
    const popupElement = document.getElementById("popup-div");

    if (popupElement) {
        popupElement.remove();
    }
}