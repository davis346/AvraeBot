(function () {
  const addButton = () => {
    const monsterNameElement2014 = document.querySelector(".mon-stat-block__name");
    const monsterNameElement2024 = document.querySelector(".mon-stat-block-2024__name");
    if ((!monsterNameElement2014 && !monsterNameElement2024) || document.getElementById("avrae-button")) return;

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
    button.style.float = "right";

    // Determine where to place the button
    if (monsterNameElement2024) {
        button.style.float = "right";
        monsterNameElement2024.appendChild(button);
    } else if (monsterNameElement2014) {
        button.style.float = "right";
        monsterNameElement2014.appendChild(button);
    }

    button.addEventListener("click", () => {
    if (monsterNameElement2024) {
        const clonedElement = monsterNameElement2024.cloneNode(true);
        clonedElement.querySelector("#avrae-button")?.remove();
        monsterName = clonedElement.textContent.trim();
    } else if (monsterNameElement2014) {
        const clonedElement = monsterNameElement2014.cloneNode(true);
        clonedElement.querySelector("#avrae-button")?.remove();
        monsterName = clonedElement.textContent.trim();
    }

    chrome.storage.local.set({ monsterName }, () => {
        console.log(`Monster Name Stored: ${monsterName}`);
    });

    chrome.runtime.sendMessage({ type: "openPopup" });
    })};

  addButton();
})();
const extractedAttacks = new Set();

document.querySelectorAll('[data-rollaction]').forEach((element) => {
  const attackName = element.getAttribute('data-rollaction');
  if (attackName) extractedAttacks.add(attackName);
});

// Send extracted attack names to the background script
chrome.runtime.sendMessage({ type: "monsterAttacks", data: Array.from(extractedAttacks) });

const extractedSpells = new Set();

document.querySelectorAll('a.spell-tooltip').forEach((element) => {
  const spellName = element.textContent.trim();
  if (spellName) extractedSpells.add(spellName);
});

// Send extracted spells to the background script
chrome.runtime.sendMessage({ type: "monsterSpells", data: Array.from(extractedSpells) })
