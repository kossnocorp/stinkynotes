chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id && tab.url) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_NOTE" });
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "UPDATE_ICON" && sender.tab && sender.tab.id) {
    const { hasNote } = message.payload;
    const pathPrefix = hasNote ? "icons/icon-yellow" : "icons/icon-gray";

    chrome.action.setIcon({
      tabId: sender.tab.id,
      path: {
        "16": `${pathPrefix}-16.png`,
        "32": `${pathPrefix}-32.png`,
        "48": `${pathPrefix}-48.png`,
        "128": `${pathPrefix}-128.png`,
      },
    });
  }
});
