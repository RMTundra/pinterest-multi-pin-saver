let selectEnabled = false;
let pinList = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received: ", message);

    if (message.action === "activateMode") {
        if (!selectEnabled) {
            console.log("Select enabled");
            selectEnabled = true;
            activateLogger();
            sendResponse({ status: "Select enabled" });
        }
    }
    else if (message.action === "deactivateMode") {
        if (selectEnabled) {
            console.log("Select deactivated");
            selectEnabled = false;
            disableLogger();
            sendResponse({ status: "Select deactivated" });

            pinList = [];
        }
    }

    return true;
})

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