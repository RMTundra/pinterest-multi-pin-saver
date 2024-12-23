let selectedBoardId, selectedSectionId;

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

async function getAccessToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['access_token'], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else if (result.access_token) {
                resolve(result.access_token);
            } else {
                reject('Access token not found');
            }
        });
    });
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

async function fetchBoards(accessToken) {
    try {
        const response = await fetch("https://api.pinterest.com/v5/boards", {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        if (!response.ok) throw new Error("Failed to fetch boards");

        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error("Error fetching boards: ", error);
        return [];
    }
}

async function fetchSections(boardId, accessToken) {
    try {
        const response = await fetch(`https://api.pinterest.com/v5/boards/${boardId}/sections`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) throw new Error("Failed to fetch sections");

        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error fetching sections:', error);
        return [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const boardDropdown = document.getElementById("boardSelector");
    const sectionDropdown = document.getElementById("sectionSelector");

    boardDropdown.innerHTML = "<option value=''>Loading boards...</option>";
    sectionDropdown.innerHTML = "<option value=''>Loading sections...</option>";

    populateBoardsDropdown();

    async function populateBoardsDropdown() {
        try {
            const accessToken = await getAccessToken();
            const boards = await fetchBoards(accessToken);

            boardDropdown.innerHTML = "<option value=''>Select a board...</option>";

            boards.forEach((board) => {
                const option = document.createElement("option");
                option.value = board.id;
                option.textContent = board.name;
                boardDropdown.appendChild(option);
            })

            boardDropdown.addEventListener("change", () => {
                selectedBoardId = boardDropdown.value;
                console.log(selectedBoardId);

                if (selectedBoardId) {
                    populateSectionsDropdown(selectedBoardId);
                }
                else {
                    sectionDropdown.innerHTML = "<option value=''>Select a board first...</option>";
                }
            })
        } catch (error) {
            console.error("Error populating boards dropdown: ", error);
            boardDropdown.innerHTML = "<option value=''>Failed to load boards</option>";
            sectionDropdown.innerHTML = "<option value=''>Failed to load sections</option>";
        }
    }

    async function populateSectionsDropdown(boardId) {
        try {
            const accessToken = await getAccessToken();
            const sections = await fetchSections(boardId, accessToken);

            sectionDropdown.innerHTML = "<option value=''>Select a section ...</option>";

            sections.forEach((section) => {
                const option = document.createElement("option");
                option.value = section.id;
                option.textContent = section.name;
                sectionDropdown.appendChild(option);
            })

            sectionDropdown.addEventListener("change", () => {
                selectedSectionId = sectionDropdown.value;
                console.log(selectedSectionId);
            })
        } catch (error) {
            console.error("Error populating sections dropdown:", error);
            sectionDropdown.innerHTML = "<option value=''>Failed to load sections</option>";
        }
    }
})

document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("save");
    if (saveButton) {
        saveButton.addEventListener("click", async () => {
            if (selectedBoardId && selectedSectionId) {
                const boardId = selectedBoardId;
                const sectionId = selectedSectionId;

                try {
                    const selectedPins = await getSelectedPins();

                    if (selectedPins.length === 0) {
                        alert("No pins selected to save");
                        return;
                    }

                    const accessToken = await getAccessToken();

                    for (const pin of selectedPins) {
                        console.log(`Saving pin ${pin.pinID} to board ${selectedBoardId}, section ${selectedSectionId}`);
                        await savePinToSection(pin.pinID, boardId, sectionId, accessToken);
                    }

                    alert("Pins successfully saved.");
                } catch (error) {
                    console.error("Error saving pins: ", error);
                }
            } else {
                alert("Please select both board and section.");
            }
        });
    } else {
        console.error("Save button not found in the DOM.");
    }
});

async function getSelectedPins() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getSelectedPins" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error communicating with content script:", chrome.runtime.lastError.message);
                } else if (response) {
                    console.log("Selected pins:", response);
                    resolve(response);
                } else {
                    console.warn("No response received from content script.");
                }
            });
        });
    });
}

async function savePinToSection(pinID, boardId, sectionId, accessToken) {
    const url = `https://api.pinterest.com/v5/pins/${pinID}/save`;
    const body = JSON.stringify({
        board_id: boardId,
        board_section_id: sectionId
    })

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: body
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to save pin ${pinID}: `, error);
        }
    } catch (error) {
        if (error.json) {
            const errorDetails = await error.json();
            console.error(`Error saving pin ${pinID}: `, errorDetails);
        } else {
            console.error(`Error saving pin ${pinID}: `, error);
        }
        throw error;
    }
}

initialButtonStates();