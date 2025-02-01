(function () {
  const addButton = () => {
    const monsterNameElement = document.querySelector(".mon-stat-block__name");
    if (!monsterNameElement || document.getElementById("avrae-button")) return;

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

      chrome.runtime.sendMessage({ type: "openPopup", monsterName });
    });

    monsterNameElement.appendChild(button);
  };

  addButton();
})();
