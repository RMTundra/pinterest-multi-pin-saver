function initialButtonStates() {
    chrome.storage.local.get(["selectPinsColor", "deselectPinsColor"], (result) => {
        const activeBtn = document.getElementById("selectPins");
        const deactiveBtn = document.getElementById("deselectPins");

        activeBtn.style.backgroundColor = result.selectPinsColor || "#000";
        deactiveBtn.style.backgroundColor = result.deselectPinsColor || "#000";
    });
}

function websiteCheck() {
    const website = ["https://*.pinterest.com/*", "https://*.pinterest.com/"];
    return website.some((websites) => url.startsWith(websites)); 
}

document.getElementById("selectPins").addEventListener("click", () => {
    console.log("Clicked. Sending.");

    const activeBtn = document.getElementById("selectPins");
    const deactiveBtn = document.getElementById("deselectPins");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "activateMode" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Failed: ", chrome.runtime.lastError);
            }
            else {
                activeBtn.style.backgroundColor = "#adff2f";
                deactiveBtn.style.backgroundColor = "#ff0038";

                chrome.storage.local.set({
                    selectPinsColor: "#adff2f",
                    deselectPinsColor: "#ff0038"
                });

                console.log("Done.");
            }
        });
    });
});

document.getElementById("deselectPins").addEventListener("click", () => {
    console.log("Clicked. Sending.");

    const activeBtn = document.getElementById("selectPins");
    const deactiveBtn = document.getElementById("deselectPins");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "deactivateMode" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Failed: ", chrome.runtime.lastError);
            }
            else {
                activeBtn.style.backgroundColor = "#000";
                deactiveBtn.style.backgroundColor = "#000";

                chrome.storage.local.set({
                    selectPinsColor: "#000",
                    deselectPinsColor: "#000"
                });

                console.log("Done.");
            }
        });
    });
});

initialButtonStates();