document.addEventListener("DOMContentLoaded", () => {
  // Tabs functionality
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      tabs.forEach((tab) => tab.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      e.target.classList.add("active");
      const targetTab = e.target.getAttribute("data-target");
      document.getElementById(targetTab).classList.add("active");
    });
  });

  // Default active tab
  const defaultActiveTab = document.querySelector(".tab.active");
  if (defaultActiveTab) {
    defaultActiveTab.click();
  }

  chrome.storage.local.get("monsterName", (data) => {
    if (data.monsterName) {
      monsterNameInput.value = data.monsterName;
      healthMonsterName.value = data.monsterName;
      combatMonsterName.value = data.monsterName;
    }
  });

  // Collapsible "Modify Stats" functionality
  const modifyStatsButton = document.getElementById("modify-stats-button");
  const statsOptions = document.getElementById("stats-options");

  if (modifyStatsButton && statsOptions) {
    modifyStatsButton.addEventListener("click", () => {
      const isVisible = statsOptions.style.display === "block";
      statsOptions.style.display = isVisible ? "none" : "block";
      modifyStatsButton.textContent = isVisible ? "+" : "-";
    });
  }

  // Copy to clipboard functionality for different command outputs
  function setupCopyButton(copyButtonId, outputId, tooltipId) {
    const copyButton = document.getElementById(copyButtonId);
    const tooltip = document.getElementById(tooltipId);
    const output = document.getElementById(outputId);

    if (copyButton) {
      copyButton.addEventListener("click", () => {
        output.select();
        output.setSelectionRange(0, 99999); // For mobile devices
        navigator.clipboard.writeText(output.value);
        tooltip.textContent = "Copied!";
      });

      copyButton.addEventListener("mouseout", () => {
        tooltip.textContent = "Copy to clipboard";
      });
    }
  }

  setupCopyButton("command-copy-button", "command-output", "commandtooltip");
  setupCopyButton("health-copy-button", "apply-health-output", "healthtooltip");
  setupCopyButton("kill-copy-button", "health-command-output", "killtooltip");

  // Monster Generator Logic
  const generateCommandButton = document.getElementById("generate-command");
  const commandOutput = document.getElementById("command-output");
  const monsterNameInput = document.getElementById("monster-name");
  const monsterCountInput = document.getElementById("monster-count");
  const hpOptionSelect = document.getElementById("hp-option");
  const manualHpInput = document.getElementById("manual-hp");
  const groupNameInput = document.getElementById("group-name");
  const acInput = document.getElementById("ac");
  const initiativeBonusInput = document.getElementById("initiative-bonus");
  const advantageCheckbox = document.getElementById("advantage");
  const disadvantageCheckbox = document.getElementById("disadvantage");

  if (hpOptionSelect && manualHpInput) {
    hpOptionSelect.addEventListener("change", () => {
      manualHpInput.style.display = hpOptionSelect.value === "manual" ? "block" : "none";
    });
  }

  if (generateCommandButton) {
    generateCommandButton.addEventListener("click", () => {
      const monsterName = monsterNameInput.value.trim();
      const monsterCount = parseInt(monsterCountInput.value, 10);
      const hpOption = hpOptionSelect.value;
      const manualHp = manualHpInput.value.trim();
      const groupName = groupNameInput.value.trim();
      const ac = acInput.value.trim();
      const initiativeBonus = initiativeBonusInput.value.trim();
      const advantage = advantageCheckbox.checked;
      const disadvantage = disadvantageCheckbox.checked;

      let command = monsterCount > 1
        ? `!madd "${monsterName}#" -n ${monsterCount}`
        : `!madd "${monsterName}"`;

      if (hpOption === "rollhp") command += " -rollhp";
      if (hpOption === "manual" && manualHp) command += ` -hp ${manualHp}`;
      if (groupName) command += ` -group "${groupName}"`;
      if (ac) command += ` -ac ${ac}`;
      if (initiativeBonus) command += ` -b ${initiativeBonus}`;
      if (advantage) command += " adv";
      if (disadvantage) command += " dis";

      commandOutput.value = command;
    });
  }

  // Apply Health Command Generation
  const healthMonsterName = document.getElementById("health-monster-name");
  const healthPositionNumber = document.getElementById("health-position-number");
  const applyHealthButton = document.getElementById("apply-health");
  const applyHealthOutput = document.getElementById("apply-health-output");
  const healRadio = document.getElementById("heal-radio");
  const damageRadio = document.getElementById("damage-radio");
  const healthValueInput = document.getElementById("hp-value");

  if (applyHealthButton) {
    applyHealthButton.addEventListener("click", () => {
      const hmonsterName = healthMonsterName.value.trim();
      const position = healthPositionNumber.value ? `#${healthPositionNumber.value}` : "";
      const fullMonsterName = `${monsterName}${position}`;
      const hpValue = healthValueInput.value.trim();

      if (!hmonsterName) {
        applyHealthOutput.value = "Error: Please enter a monster name.";
        return;
      }

      if (!hpValue || isNaN(hpValue)) {
        applyHealthOutput.value = "Error: Please enter a valid HP value.";
        return;
      }

      let hpCommand = healRadio.checked 
        ? `!i opt "${fullMonsterName}" -hp +${hpValue}` 
        : `!i opt "${fullMonsterName}" -hp -${hpValue}`;

      applyHealthOutput.value = hpCommand;
    });
  }

  // Kill Monster Command
  const killMonsterButton = document.getElementById("kill-monster");
  const healthCommandOutput = document.getElementById("health-command-output");

  if (killMonsterButton) {
    killMonsterButton.addEventListener("click", () => {
      const monsterName = healthMonsterName.value.trim();
      const position = healthPositionNumber.value ? `#${healthPositionNumber.value}` : "";
      const fullMonsterName = `${monsterName}${position}`;

      healthCommandOutput.value = monsterName 
        ? `!init remove "${fullMonsterName}"` 
        : "Error: Please enter a monster name.";
    });
  }

  const combatMonsterName = document.getElementById("combat-monster-name");
  const combatOptionsTab = document.getElementById("combat-options");
  const attackTable = document.getElementById("attack-table");
  const targetInput = document.getElementById("attack-target");
  const attackCommandOutput = document.getElementById("attack-command-output");

  if (!combatOptionsTab || !attackTable) {
    console.error("Combat options or attack table not found.");
    return;
  }

  // Retrieve stored monster name and attacks
  chrome.storage.local.get(["monsterName", "monsterAttacks"], (data) => {
    if (!data.monsterName || !data.monsterAttacks) {
      console.error("Monster data not found in storage.");
      return;
    }

    combatMonsterName.value = data.monsterName; // Pre-fill monster name

    if (data.monsterAttacks.length === 0) {
      attackTable.innerHTML = "<p>No attacks found.</p>";
      return;
    }

    attackTable.innerHTML = ""; // Clear any previous content

    data.monsterAttacks.forEach((attack) => {
      const attackButton = document.createElement("button");
      attackButton.textContent = attack;
      attackButton.classList.add("attack-button");
      attackButton.addEventListener("click", () => {
        const target = targetInput.value.trim() || "Unknown Target";
        const rollOption = document.querySelector('input[name="attack-roll"]:checked').value;
        let rollFlag = "";

        if (rollOption === "advantage") rollFlag = " -adv";
        else if (rollOption === "disadvantage") rollFlag = " -dis";

        const command = `!ma "${data.monsterName}" "${attack}" -t "${target}"${rollFlag}`;
        attackCommandOutput.value = command;
      });

      attackTable.appendChild(attackButton);
    });
  });
});
