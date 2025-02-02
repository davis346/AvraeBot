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

  const storedMonsterNameDisplay = document.getElementById("stored-monster-name-display");

  chrome.storage.local.get("monsterName", (data) => {
    if (data.monsterName) {
      storedMonsterName = data.monsterName;
      storedMonsterNameDisplay.innerHTML = `<strong>Base Monster:</strong> ${data.monsterName}`;
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
  setupCopyButton("action-copy-button", "action-command-output", "actiontooltip");
  setupCopyButton("utility-copy-button", "utility-command-output", "utilitytooltip");

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

  const syncMonsterName = syncField(monsterNameFields, "monsterName");
  monsterNameFields.forEach(field => field.addEventListener("input", syncMonsterName));
  chrome.storage.local.get("monsterName", (data) => {
    if (data.monsterName) monsterNameFields.forEach(field => field.value = data.monsterName);
  });

  const syncPositionNumber = syncField(positionNumberFields, "positionNumber");
  positionNumberFields.forEach(field => field.addEventListener("input", syncPositionNumber));
  chrome.storage.local.get("positionNumber", (data) => {
    positionNumberFields.forEach(field => {
      field.value = data.positionNumber || "";
    });
  });

  function setupButtonSelection(containerSelector, buttonClass, clearCallback, variableRef, relatedGroup) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
  
    container.addEventListener("click", (event) => {
      if (event.target.classList.contains(buttonClass)) {
        if (variableRef.value === event.target) {
          event.target.classList.remove("selected");
          variableRef.value = null;
          clearCallback();
        } else {
          if (variableRef.value) variableRef.value.classList.remove("selected");
          variableRef.value = event.target;
          variableRef.value.classList.add("selected");
        }
      }
    });
  
    relatedGroup.forEach((elementId) => {
      document.getElementById(elementId)?.addEventListener("change", () => {
        if (variableRef.value) {
          variableRef.value.classList.remove("selected");
          variableRef.value = null;
          clearCallback();
        }
      });
    });
  }
  
  let selectedSkill = { value: null };
  let selectedAction = { value: null };
  
  function clearSelectedSkill() {
    selectedSkill.value = null;
    document.getElementById("skill-command-output").value = "";
  }
  
  function clearSelectedAction() {
    selectedAction.value = null;
    document.getElementById("action-command-output").value = "";
  }
  
  setupButtonSelection("#skill-buttons", "skill-button", clearSelectedSkill, selectedSkill, ["save-mode"]);
  setupButtonSelection("#save-buttons", "save-button", clearSelectedSkill, selectedSkill, ["check-mode"]);
  setupButtonSelection("#attack-buttons", "attack-button", clearSelectedAction, selectedAction, ["spell-mode"]);
  setupButtonSelection("#spell-buttons", "spell-button", clearSelectedAction, selectedAction, ["attack-mode"]);  

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
  const advantageCheckbox = document.getElementById("init-advantage");
  const disadvantageCheckbox = document.getElementById("init-disadvantage");

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
  const generateSkillButton = document.getElementById("generate-skill-command");

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
    
    if (selectedSkill.value) {
      selectedSkill.value.classList.remove("selected");
      selectedSkill.value = null;
      clearSelectedSkill();
    }
  
    createButtons(skillButtonsContainer, skills, "!mc");
  });

  document.getElementById("save-mode").addEventListener("change", () => {
    skillButtonsContainer.style.display = "none";
    saveButtonsContainer.style.display = "grid";
  
    if (selectedSkill.value) {
      selectedSkill.value.classList.remove("selected");
      selectedSkill.value = null;
      clearSelectedSkill();
    }
  
    createButtons(saveButtonsContainer, saves, "!ms");
  });

  generateSkillButton.addEventListener("click", () => {
    if (!selectedSkill.value) {
      skillCommandOutput.value = "Please select a skill or save.";
      return;
    }

    const prefix = document.getElementById("check-mode").checked ? "!mc" : "!ms";
    const option = selectedSkill.value.textContent;
    const monsterName = getMonsterName();
    const position = getPositionNumber();
    const fullMonsterName = position ? `${monsterName}${position}` : monsterName;
    const rollType = document.querySelector('input[name="roll-type"]:checked').value;
    const skillDcValue = document.getElementById("skill-dc").value.trim();
    const skillRerollValue = document.getElementById("skill-rerolls").value.trim();
    const skillBonusValue = document.getElementById("skill-bonus").value.trim();
  
    if (!monsterName) {
      skillCommandOutput.value = "Error: Please enter a monster name.";
      return;
    }
  
    let rollFlag = rollType === "advantage" ? " adv" : rollType === "disadvantage" ? " dis" : "";
    let dcFlag = skillDcValue ? ` -dc ${skillDcValue}` : "";
    let rrFlag = skillRerollValue ? ` -rr ${skillRerollValue}` : "";
    let bonusFlag = skillBonusValue ? ` -b ${skillBonusValue}` : "";
    let title = ` -title "${fullMonsterName} makes ${option} ${prefix === '!mc' ? 'Skill Check' : 'Saving Throw'}"`;
  
    const command = `${prefix} "${storedMonsterName}" ${option.toLowerCase()}${rollFlag}${dcFlag}${rrFlag}${bonusFlag}${title}`;
    skillCommandOutput.value = command;
  });

  createButtons(saveButtonsContainer, saves, "!ms");
  
  const attackButtonsContainer = document.getElementById("attack-buttons");
  const spellButtonsContainer = document.getElementById("spell-buttons");
  const attackModeRadio = document.getElementById("attack-mode");
  const spellModeRadio = document.getElementById("spell-mode");
  const generateActionCommandButton = document.getElementById("generate-action-command");
  const actionCommandOutput = document.getElementById("action-command-output");

  let actionType = "attack";

  attackModeRadio.addEventListener("change", () => {
    attackButtonsContainer.style.display = "grid";
    spellButtonsContainer.style.display = "none";
    actionType = "attack";
  
    if (selectedAction.value) {
      selectedAction.value.classList.remove("selected");
      selectedAction.value = null;
      clearSelectedAction();
    }
  });
  
  spellModeRadio.addEventListener("change", () => {
    attackButtonsContainer.style.display = "none";
    spellButtonsContainer.style.display = "grid";
    actionType = "spell";
  
    if (selectedAction.value) {
      selectedAction.value.classList.remove("selected");
      selectedAction.value = null;
      clearSelectedAction();
    }
  });

  chrome.storage.local.get("monsterAttacks", (data) => {
    attackButtonsContainer.innerHTML = "";
  
    if (data.monsterAttacks && data.monsterAttacks.length > 0) {
      data.monsterAttacks.forEach((attackName) => {
        const button = document.createElement("button");
        button.textContent = attackName;
        button.classList.add("attack-button");
  
        button.addEventListener("click", () => {
          if (selectedAction) selectedAction.classList.remove("selected");
          selectedAction = button;
          button.classList.add("selected");
        });
  
        attackButtonsContainer.appendChild(button);
      });
    } else {
      attackButtonsContainer.innerHTML = "<h3><strong>No attacks found.</strong></h3>";
    }
  });

  chrome.storage.local.get("monsterSpells", (data) => {
    spellButtonsContainer.innerHTML = "";

    if (data.monsterSpells && data.monsterSpells.length > 0) {
      data.monsterSpells.forEach((spellName) => {
        const button = document.createElement("button");
        button.textContent = spellName;
        button.classList.add("spell-button");

        button.addEventListener("click", () => {
          if (selectedAction) selectedAction.classList.remove("selected");
          selectedAction = button;
          button.classList.add("selected");
        });

        spellButtonsContainer.appendChild(button);
      });
    } else {
      spellButtonsContainer.innerHTML = "<h3><strong>No spells found.</strong><h3>";
    }
  });

  generateActionCommandButton.addEventListener("click", () => {
    if (!selectedAction.value) {
      actionCommandOutput.value = "Error: Please select an attack or spell.";
      return;
    }

    const monsterName = getMonsterName();
    const position = getPositionNumber();
    const fullMonsterName = position ? `${monsterName}${position}` : monsterName;
    const actionName = selectedAction.value.textContent;
    const target = document.getElementById("attack-target").value.trim();
    const attackRerolls = document.getElementById("attack-rerolls").value.trim();
    const attackDcValue = document.getElementById("attack-dc").value.trim();
    const attackBonus = document.getElementById("attack-bonus").value.trim();
    const rollType = document.querySelector('input[name="attack-roll-type"]:checked').value;
    const title = ` -title "${fullMonsterName} uses ${actionName}"`;

    if (!monsterName) {
      actionCommandOutput.value = "Error: Please enter a monster name.";
      return;
    }

    let commandPrefix = actionType === "attack" ? "!ma" : "!mcast";
    let command = `${commandPrefix} "${storedMonsterName}" "${actionName}"`;

    if (target) {
      const targets = target.split(",").map(t => t.trim()).filter(t => t);
      command += targets.map(target => ` -t "${target}"`).join("");
    }

    if (attackRerolls) command += ` -rr ${attackRerolls}`;
    if (attackDcValue) command += ` -dc ${attackDcValue}`;
    if (attackBonus) command += ` -b ${attackBonus}`;
    if (rollType === "advantage") command += " adv sadv";
    if (rollType === "disadvantage") command += " dis sdis";
    command += title;

    actionCommandOutput.value = command;
  });

  const utilityButtons = document.querySelectorAll(".utility-button");
  const utilityOutput = document.getElementById("utility-command-output");

  utilityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.getAttribute("data-command");
      utilityOutput.value = command;
    });
  });
});
