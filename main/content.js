const checkedPins = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.action === "activateMode") {
            activateMode();

            sendResponse({ status: "Select enabled" });
        } else if (message.action === "deactivateMode") {
            deactivateMode();

            sendResponse({ status: "Select deactivated" });
        } else if (message.action === "getSelectedPins") {
            sendResponse(Array.from(checkedPins.values()));
        } else {
            sendResponse({ status: "Unknown action" });
        }
    } catch (error) {
        console.error("Error handling message:", error);
        sendResponse({ status: "Error", message: error.message });
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
            event.stopPropagation();

            const pinID = pinElement.getAttribute("data-test-pin-id") || "No ID";
            const imgUrl = pinElement.querySelector("img")?.src || "No img url";

            if (checkedPins.has(pinID)) {
                checkedPins.delete(pinID);
                pinElement.style.backgroundColor = "";
            }
            else {
                checkedPins.set(pinID, { pinID, imgUrl });
                pinElement.style.backgroundColor = "#d3d3d3";
            }
        }
    };

    const observer = new MutationObserver(() => {
        document.querySelectorAll(`div[data-test-id="pin"]`).forEach((pinElement) => {
            const pinID = pinElement.getAttribute("data-test-pin-id") || "No ID";
            
            let checkIcon = pinElement.querySelector(".check-icon");

            if (checkedPins.has(pinID)) {
                pinElement.style.backgroundColor = "#d3d3d3";
                
                if (!checkIcon) {
                    checkIcon = document.createElement("span");
                    checkIcon.classList.add("check-icon");
                    checkIcon.innerHTML = "✔";
                    pinElement.appendChild(checkIcon);
                }

                checkIcon.style.position = "absolute";
                checkIcon.style.display = "flex";
                checkIcon.style.alignItems = "center";
                checkIcon.style.justifyContent = "center";
                checkIcon.style.width = "28px";
                checkIcon.style.height = "28px";
                checkIcon.style.top = "8px";
                checkIcon.style.right = "8px";

                checkIcon.style.backgroundColor = "#000";
                checkIcon.style.color = "#00ff00";
                checkIcon.style.borderRadius = "50%";
                checkIcon.style.fontSize = "16px";
                checkIcon.style.padding = "4px";
            }
            else {
                pinElement.style.backgroundColor = "";

                if (checkIcon) {
                    checkIcon.remove();
                }
            }
        });
    });

    observer.observe(container, { childList: true, subtree: true });
    container.addEventListener("click", pinClickHandler, true);
}

function disableLogger() {
    const container = document.querySelector(".masonryContainer");
    const pins = container.querySelectorAll(`div[data-test-id="pin"]`);

    if (container) {
        container.removeEventListener("click", pinClickHandler, true);
        pinClickHandler = null;

        pins.forEach((pin) => {
            let pinID = pin.getAttribute("data-test-pin-id");
            checkedPins.delete(pinID);
        })
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

function activateMode() {
    activateLogger();

    showPopup("Select mode activated!");
}

function deactivateMode() {
    disableLogger();

    hidePopup();
}

document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("selectEnabled")) {
        activateMode();
    }
    else {
        deactivateMode();
    }
})

