document.getElementById("selectPins").addEventListener("click", () => {
    console.log("Clicked. Sending.");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "activateMode" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Failed: ", chrome.runtime.lastError);
            }
            else {
                console.log("Done.");
            }
        });
    });
});

document.getElementById("deselectPins").addEventListener("click", () => {
    console.log("Clicked. Sending.");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "deactivateMode" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Failed: ", chrome.runtime.lastError);
            }
            else {
                console.log("Done.");
            }
        });
    });
});