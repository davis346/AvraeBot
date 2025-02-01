document.addEventListener("DOMContentLoaded", () => {
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

  const defaultActiveTab = document.querySelector(".tab.active");
  if (defaultActiveTab) {
    defaultActiveTab.click();
  }

  chrome.storage.local.get("monsterName", (data) => {
    if (data.monsterName) {
      storedMonsterName = data.monsterName;
      monsterNameInput.value = data.monsterName;
    }
  });

  const modifyStatsButton = document.getElementById("modify-stats-button");
  const statsOptions = document.getElementById("stats-options");

  if (modifyStatsButton && statsOptions) {
    modifyStatsButton.addEventListener("click", () => {
      const isVisible = statsOptions.style.display === "block";
      statsOptions.style.display = isVisible ? "none" : "block";
      modifyStatsButton.textContent = isVisible ? "+" : "-";
    });
  }

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
  setupCopyButton("skill-copy-button", "skill-command-output", "skilltooltip");

  const monsterNameFields = document.querySelectorAll('[id="monster-name"]');
  const positionNumberFields = document.querySelectorAll('[id="position-number"]');

  function syncField(fields, key) {
    return function (event) {
      const newValue = event.target.value;
      fields.forEach(field => {
        if (field !== event.target) {
          field.value = newValue;
        }
      });
      chrome.storage.local.set({ [key]: newValue });
    };
  }

  // Sync Monster Name
  const syncMonsterName = syncField(monsterNameFields, "monsterName");
  monsterNameFields.forEach(field => field.addEventListener("input", syncMonsterName));
  chrome.storage.local.get("monsterName", (data) => {
    if (data.monsterName) monsterNameFields.forEach(field => field.value = data.monsterName);
  });

  // Sync Position Number
  const syncPositionNumber = syncField(positionNumberFields, "positionNumber");
  positionNumberFields.forEach(field => field.addEventListener("input", syncPositionNumber));
  chrome.storage.local.get("positionNumber", (data) => {
    positionNumberFields.forEach(field => {
      field.value = data.positionNumber || "";
    });
  });
  

  function getMonsterName() {
    const nameInput = document.querySelector('[id="monster-name"]');
    return nameInput ? nameInput.value.trim() : "";
  }

  function getPositionNumber() {
    const positionInput = document.querySelector('[id="position-number"]');
    return positionInput ? positionInput.value.trim() : "";
  }
  const generateCommandButton = document.getElementById("generate-command");
  const commandOutput = document.getElementById("command-output");
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
      const monsterName = getMonsterName();
      const monsterCount = parseInt(monsterCountInput.value, 10);
      const hpOption = hpOptionSelect.value;
      const manualHp = manualHpInput.value.trim();
      const groupName = groupNameInput.value.trim();
      const ac = acInput.value.trim();
      const initiativeBonus = initiativeBonusInput.value.trim();
      const advantage = advantageCheckbox.checked;
      const disadvantage = disadvantageCheckbox.checked;

      let command = `!i madd "${storedMonsterName}"`;

      command += monsterCount > 1
        ? ` -name "${monsterName}#" -n ${monsterCount}`
        : ` -name "${monsterName}"`;

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
  
  const applyHealthButton = document.getElementById("apply-health");
  const applyHealthOutput = document.getElementById("apply-health-output");
  const healRadio = document.getElementById("heal-radio");
  const healthValueInput = document.getElementById("hp-value");

  if (applyHealthButton) {
    applyHealthButton.addEventListener("click", () => {
      const monsterName = getMonsterName();
      const position = getPositionNumber();
      const fullMonsterName = position ? `${monsterName}${position}` : monsterName;
      const hpValue = healthValueInput.value.trim();

      if (!monsterName) {
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

  const killMonsterButton = document.getElementById("kill-monster");
  const healthCommandOutput = document.getElementById("health-command-output");

  if (killMonsterButton) {
    killMonsterButton.addEventListener("click", () => {
      const monsterName = getMonsterName();
      const position = getPositionNumber();
      const fullMonsterName = position ? `${monsterName}${position}` : monsterName;
  
      if (!monsterName) {
        healthCommandOutput.value = "Error: Please enter a monster name.";
        return;
      }
  
      healthCommandOutput.value = `!i remove "${fullMonsterName}"`;
    });
  }
  

  const skillButtonsContainer = document.getElementById("skill-buttons");
  const saveButtonsContainer = document.getElementById("save-buttons");
  const skillCommandOutput = document.getElementById("skill-command-output");
  const generateButton = document.getElementById("generate-skill-command");

  let selectedSkill = null;

  const skills = ["Athletics", "Acrobatics", "Sleight of Hand", "Stealth", "Arcana", "History", "Investigation", "Nature", "Religion", "Animal Handling", "Insight", "Medicine", "Perception", "Survival", "Deception", "Intimidation", "Performance", "Persuasion"];
  const saves = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];

  function createButtons(container, options, commandPrefix) {
    container.innerHTML = "";
    container.classList.add("button-grid");
  
    options.forEach(option => {
      const button = document.createElement("button");
      button.textContent = option;
      button.classList.add(commandPrefix === "!ms" ? "save-button" : "skill-button");
  
      button.addEventListener("click", () => {
        if (selectedSkill) {
          selectedSkill.classList.remove("selected");
        }
        selectedSkill = button;
        button.classList.add("selected");
      });
      
      container.appendChild(button);
    });
  }

  document.getElementById("check-mode").addEventListener("change", () => {
    skillButtonsContainer.style.display = "grid";
    saveButtonsContainer.style.display = "none";
    createButtons(skillButtonsContainer, skills, "!mc");
  });

  document.getElementById("save-mode").addEventListener("change", () => {
    skillButtonsContainer.style.display = "none";
    saveButtonsContainer.style.display = "grid";
    createButtons(saveButtonsContainer, saves, "!ms");
  });

  generateButton.addEventListener("click", () => {
    if (!selectedSkill) {
      skillCommandOutput.value = "Please select a skill or save.";
      return;
    }

    const prefix = document.getElementById("check-mode").checked ? "!mc" : "!ms";
    const option = selectedSkill.textContent;
    const monsterName = getMonsterName();
    const position = getPositionNumber();
    const fullMonsterName = position ? `${monsterName}${position}` : monsterName;
    const rollType = document.querySelector('input[name="roll-type"]:checked').value;
    const dcValue = document.getElementById("set-dc").value.trim();
    const rerollValue = document.getElementById("rerolls").value.trim();
    const bonusValue = document.getElementById("add-bonus").value.trim();
  
    if (!monsterName) {
      skillCommandOutput.value = "Error: Please enter a monster name.";
      return;
    }
  
    let rollFlag = rollType === "advantage" ? " adv" : rollType === "disadvantage" ? " dis" : "";
    let dcFlag = dcValue ? ` -dc ${dcValue}` : "";
    let rrFlag = rerollValue ? ` -rr ${rerollValue}` : "";
    let bonusFlag = bonusValue ? ` -b ${bonusValue}` : "";
    let title = ` -title "${fullMonsterName} makes ${option} ${prefix === '!mc' ? 'Skill Check' : 'Saving Throw'}"`;
  
    const command = `${prefix} "${storedMonsterName}" ${option.toLowerCase()}${rollFlag}${dcFlag}${rrFlag}${bonusFlag}${title}`;
    skillCommandOutput.value = command;
  });

  createButtons(saveButtonsContainer, saves, "!ms");
});
