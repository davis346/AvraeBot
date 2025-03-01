(function () {
    function addButton() {
        const monsterNameElement2014 = document.querySelector(".mon-stat-block__name");
        const monsterNameElement2024 = document.querySelector(".mon-stat-block-2024__name");
        const manageButton = document.querySelector("button.ct-theme-button--outline.ct-button.character-button.ddbc-button.character-button-small");

        if ((!monsterNameElement2014 && !monsterNameElement2024 && !manageButton) || document.getElementById("avrae-button")) return;

        // Create the Avrae button
        const button = document.createElement("button");
        button.id = "avrae-button";
        button.textContent = "Avrae";
        button.style.marginLeft = "10px";
        button.style.cursor = "pointer";
        button.style.padding = "3px 8px";
        button.style.fontSize = "12px";
        button.style.backgroundColor = "#0078D4";
        button.style.color = "#fff";
        button.style.border = "none";
        button.style.borderRadius = "3px";

        // Determine where to place the button
        if (monsterNameElement2024) {
            button.style.float = "right";
            monsterNameElement2024.appendChild(button);
        } else if (monsterNameElement2014) {
            button.style.float = "right";
            monsterNameElement2014.appendChild(button);
        } else if (manageButton) {
            button.style.float = "right";
            manageButton.parentElement.appendChild(button);
        }

        // Handle button click
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            let monsterName = "Unknown";
            let characterName = "Unknown Character";

            if (monsterNameElement2024) {
                const clonedElement = monsterNameElement2024.cloneNode(true);
                clonedElement.querySelector("#avrae-button")?.remove();
                monsterName = clonedElement.textContent.trim();
            } else if (monsterNameElement2014) {
                const clonedElement = monsterNameElement2014.cloneNode(true);
                clonedElement.querySelector("#avrae-button")?.remove();
                monsterName = clonedElement.textContent.trim();
            } else {
                const characterNameElement = document.querySelector("body .ddb-character-app-15ddtxx");
                if (characterNameElement) {
                    characterName = characterNameElement.textContent.trim();
                }

                chrome.storage.local.set({ characterName }, () => {
                    console.log(`Character Name Stored: ${characterName}`);
                });

                chrome.runtime.sendMessage({ type: "openCharacterPopup" });
                return;
            }

            chrome.storage.local.set({ monsterName }, () => {
                console.log(`Monster Name Stored: ${monsterName}`);
            });

            chrome.runtime.sendMessage({ type: "openMonsterPopup" });
        });

        console.log("Avrae button added.");
    }

    document.addEventListener("DOMContentLoaded", addButton);
    const observer = new MutationObserver(addButton);
    observer.observe(document.body, { childList: true, subtree: true });

})();
