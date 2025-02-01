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

  // Default active tab
  const defaultActiveTab = document.querySelector(".tab.active");
  if (defaultActiveTab) {
    defaultActiveTab.click();
  }

  chrome.storage.local.get("monsterName", (data) => {
    if (data.monsterName) {
      storedMonsterName = data.monsterName;
      monsterNameInput.value = data.monsterName;
      healthMonsterName.value = data.monsterName;
      skillMonsterName.value = data.monsterName;
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
  setupCopyButton("check-copy-button", "health-command-output", "checktooltip");

  let storedMonsterName;
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
      const inputMonsterName = monsterNameInput.value.trim();
      const monsterCount = parseInt(monsterCountInput.value, 10);
      const hpOption = hpOptionSelect.value;
      const manualHp = manualHpInput.value.trim();
      const groupName = groupNameInput.value.trim();
      const ac = acInput.value.trim();
      const initiativeBonus = initiativeBonusInput.value.trim();
      const advantage = advantageCheckbox.checked;
      const disadvantage = disadvantageCheckbox.checked;

      let command = `!madd "${storedMonsterName}"`;

      command += monsterCount > 1
        ? ` -name "${inputMonsterName}#" -n ${monsterCount}`
        : ` -name "${inputMonsterName}"`;

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
      const monsterName = healthMonsterName.value.trim();
      const position = healthPositionNumber.value ? `#${healthPositionNumber.value}` : "";
      const fullMonsterName = `${monsterName}${position}`;
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
      const monsterName = healthMonsterName.value.trim();
      const position = healthPositionNumber.value ? `#${healthPositionNumber.value}` : "";
      const fullMonsterName = `${monsterName}${position}`;

      healthCommandOutput.value = monsterName 
        ? `!init remove "${fullMonsterName}"` 
        : "Error: Please enter a monster name.";
    });
  }

  const skillMonsterName = document.getElementById("skill-monster-name");
  const skillPositionNumber = document.getElementById("skill-position-number");
  const skillButtonsContainer = document.getElementById("skill-buttons");
  const saveButtonsContainer = document.getElementById("save-buttons");
  const skillCommandOutput = document.getElementById("skill-command-output");

  const skills = ["Athletics", "Acrobatics", "Sleight of Hand", "Stealth", "Arcana", "History", "Investigation", "Nature", "Religion", "Animal Handling", "Insight", "Medicine", "Perception", "Survival", "Deception", "Intimidation", "Performance", "Persuasion"];
  const saves = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];

  function createButtons(container, options, commandPrefix) {
    container.innerHTML = "";
    container.classList.add("button-grid");
  
    options.forEach(option => {
      const button = document.createElement("button");
      button.textContent = option;
      button.classList.add(commandPrefix === "!ms" ? "save-button" : "skill-button");
  
      button.addEventListener("click", () => generateCommand(commandPrefix, option));
      
      container.appendChild(button);
    });
  }

  function generateCommand(prefix, checkName) {
    const monsterName = skillMonsterName.value.trim();
    const position = skillPositionNumber.value ? `#${skillPositionNumber.value}` : "";
    const fullMonsterName = `${monsterName}${position}`;
    const rollType = document.querySelector('input[name="roll-type"]:checked').value;
    const dcValue = document.getElementById("set-dc").value.trim();
    const rerollValue = document.getElementById("rerolls").value.trim();
    const bonusValue = document.getElementById("add-bonus").value.trim();
  
    if (!monsterName) {
      skillCommandOutput.value = "Error: Please enter a monster name.";
      return;
    }
  
    let rollFlag = rollType === "advantage" ? " -adv" : rollType === "disadvantage" ? " -dis" : "";
    let dcFlag = dcValue ? ` -dc ${dcValue}` : "";
    let rrFlag = rerollValue ? ` -rr ${rerollValue}` : "";
    let bonusFlag = bonusValue ? ` -b ${bonusValue}` : "";
  
    const command = `${prefix} "${fullMonsterName}" ${checkName.toLowerCase()}${rollFlag}${dcFlag}${rrFlag}${bonusFlag}`;
    skillCommandOutput.value = command;
  }

  document.getElementById("check-mode").addEventListener("change", () => {
    skillButtonsContainer.style.display = "grid";
    saveButtonsContainer.style.display = "none";
    skillButtonsContainer.classList.add("button-grid");
  });
  
  document.getElementById("save-mode").addEventListener("change", () => {
    skillButtonsContainer.style.display = "none";
    saveButtonsContainer.style.display = "grid";
    saveButtonsContainer.classList.add("button-grid");
  });

  createButtons(skillButtonsContainer, skills, "!mc");
  createButtons(saveButtonsContainer, saves, "!ms");
});
