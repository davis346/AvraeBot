chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "openMonsterPopup") {
    const { monsterName } = message;

    console.log("Received monster name:", monsterName);

    chrome.system.display.getInfo((displays) => {
      if (displays.length > 0) {
        const screenWidth = displays[0].workArea.width;

        chrome.windows.create({
          url: "mon_popup.html",
          type: "popup",
          width: 400,
          height: 850,
          left: Math.max(0, screenWidth - 950),
          top: 125
        });

        chrome.storage.local.set({ monsterName }, () => {
          console.log("Monster name stored:", monsterName);
        });
      }
    });

    sendResponse({ success: true });
  }

  if (message.type === "openCharacterPopup") {
    chrome.system.display.getInfo((displays) => {
      if (displays.length > 0) {
        const screenWidth = displays[0].workArea.width;

        chrome.windows.create({
          url: "char_popup.html",
          type: "popup",
          width: 400,
          height: 850,
          left: Math.max(0, screenWidth - 500),
          top: 125
        });

        chrome.storage.local.get("characterName", (data) => {
          console.log("Character name stored:", data.characterName || "Unknown Character");
        });
      }
    });

    sendResponse({ success: true });
  }

  if (message.type === "monsterAttacks") {
    console.log("Received Monster Attacks:", message.data);
    chrome.storage.local.set({ monsterAttacks: message.data });
  }

  if (message.type === "monsterSpells") {
    console.log("Received Monster Spells:", message.data);
    chrome.storage.local.set({ monsterSpells: message.data });
  }

  if (message.type === "characterActions") {
    console.log("Received Character Actions:", message.data);
    chrome.storage.local.set({ characterActions: message.data });
  }

  if (message.type === "characterSpells") {
    console.log("Received Character Spells:", message.data);
    chrome.storage.local.set({ characterSpells: message.data });
  }
});
