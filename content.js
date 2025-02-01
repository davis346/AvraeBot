(function () {
  const addButton = () => {
    const monsterNameElement = document.querySelector(".mon-stat-block__name");
    if (!monsterNameElement || document.getElementById("avrae-button")) return;

    // Extract attack names from spans with data-rolltype="to hit"
    let attackNames = new Set();
    document.querySelectorAll('span[data-rolltype="to hit"]').forEach((el) => {
      const attackName = el.getAttribute("data-rollaction");
      if (attackName) {
        attackNames.add(attackName.trim());
      }
    });

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

    button.addEventListener("click", () => {
      const clonedElement = monsterNameElement.cloneNode(true);
      clonedElement.querySelector("#avrae-button")?.remove();
      const monsterName = clonedElement.textContent.trim();

      chrome.storage.local.set({ monsterName, monsterAttacks: Array.from(attackNames) }, () => {
        console.log("Monster data stored:", monsterName, Array.from(attackNames));
      });

      chrome.runtime.sendMessage({ type: "openPopup", monsterName });
    });

    monsterNameElement.appendChild(button);
  };

  addButton();
})();
