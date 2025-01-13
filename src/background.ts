chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id && tab.url) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_NOTE" });
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "SET_ICON" && sender.tab && sender.tab.id != null) {
    const tabId = sender.tab.id;
    const { icon } = message.payload;
    chrome.action.setIcon({
      tabId,
      path: iconSizesPath(icon),
    });
  }
});

function iconSizesPath(icon: string) {
  return {
    "16": iconPath(icon, 16),
    "32": iconPath(icon, 32),
    "48": iconPath(icon, 48),
    "128": iconPath(icon, 128),
  };
}

function iconPath(icon: string, size: number) {
  return `icons/${icon}-${size}.png`;
}
