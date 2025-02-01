chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "openPopup") {
    const { monsterName } = message;

    console.log("Received monster name:", monsterName);

    chrome.system.display.getInfo((displays) => {
      if (displays.length > 0) {
        const screenWidth = displays[0].workArea.width;

        chrome.windows.create({
          url: "popup.html",
          type: "popup",
          width: 400,
          height: 800,
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
});
