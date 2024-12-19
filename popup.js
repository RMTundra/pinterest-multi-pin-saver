function initialButtonStates() {
    chrome.storage.local.get(["selectPinsColor", "deselectPinsColor"], (result) => {
        const activeBtn = document.getElementById("selectPins");
        const deactiveBtn = document.getElementById("deselectPins");

        activeBtn.style.backgroundColor = result.selectPinsColor || "#000";
        deactiveBtn.style.backgroundColor = result.deselectPinsColor || "#000";
    });
}

function isWebsiteCorrect(url) {
    const websiteRegex = /^https:\/\/([\w-]+\.)?pinterest\.com(\/.*)?$/; // Matches all subdomains and paths on pinterest.com
    return websiteRegex.test(url);
}

document.getElementById("selectPins").addEventListener("click", () => {
    const activeBtn = document.getElementById("selectPins");
    const deactiveBtn = document.getElementById("deselectPins");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];

        if (!isWebsiteCorrect(currentTab.url)) {
            console.warn("This feature is disabled on this website.");
            alert("This function is not enabled on this website.");
            return;
        }

        chrome.tabs.sendMessage(currentTab.id, { action: "activateMode" }, (response) => {
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
            }
        });
    });
});

document.getElementById("deselectPins").addEventListener("click", () => {
    const activeBtn = document.getElementById("selectPins");
    const deactiveBtn = document.getElementById("deselectPins");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];

        if (!isWebsiteCorrect(currentTab.url)) {
            console.warn("This feature is disabled on this website.");
            alert("This function is not enabled on this website.");
            return;
        }

        chrome.tabs.sendMessage(currentTab.id, { action: "deactivateMode" }, (response) => {
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
            }
        });
    });
});

initialButtonStates();