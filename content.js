let selectEnabled = false;
const checkedPins = new Map();

if (sessionStorage.getItem("selectEnabled") === "true") {
    deactivateMode();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "activateMode") {
        if (!selectEnabled) {
            selectEnabled = true;
            sessionStorage.setItem("selectEnabled", "true");
            activateLogger();

            showPopup("Select mode activated!");

            sendResponse({ status: "Select enabled" });
        }
    }
    else if (message.action === "deactivateMode") {
        if (selectEnabled) {
            deactivateMode();

            sendResponse({ status: "Select deactivated" });
        }
    }
    else if (message.action === "getSelectedPins") {
        sendResponse(Array.from(checkedPins.values()));
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

            console.log("Pin clicked"); // DEBUG
            console.log("Pin ID: ", pinID); // DEBUG
            console.log("Pin Img Url: ", imgUrl); // DEBUG
        }
    };

    const observer = new MutationObserver(() => {
        document.querySelectorAll(`div[data-test-id="pin"]`).forEach((pinElement) => {
            const pinID = pinElement.getAttribute("data-test-pin-id") || "No ID";

            if (checkedPins.has(pinID)) {
                pinElement.style.backgroundColor = "#d3d3d3";
            }
            else {
                pinElement.style.backgroundColor = "";
            }
        });
    });

    observer.observe(container, { childList: true, subtree: true });
    container.addEventListener("click", pinClickHandler, true);
}

function disableLogger() {
    const container = document.querySelector(".masonryContainer");
    const pins = container.querySelectorAll(`div[data-test-id="pin"]`);

    if (container && pinClickHandler) {
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

function deactivateMode() {
    selectEnabled = false;
    sessionStorage.removeItem("selectEnabled");
    disableLogger();
    hidePopup();
}
