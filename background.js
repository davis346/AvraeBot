chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "openPopup") {
    const { monsterName } = message;

    console.log("Received monster name:", monsterName);

    // Open the popup and store the monster name
    chrome.windows.create(
      {
        url: "popup.html",
        type: "popup",
        width: 400,
        height: 750
      },
      () => {
        chrome.storage.local.set({ monsterName }, () => {
          console.log("Monster name stored:", monsterName);
        });
      }
    );

    sendResponse({ success: true });
  }
});
