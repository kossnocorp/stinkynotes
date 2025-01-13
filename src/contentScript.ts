function storageKey(url: string): string {
  return `stinky-notes:${url}`;
}

let stickyContainer: HTMLDivElement | null = null;
let textArea: HTMLTextAreaElement | null = null;
let closeButton: HTMLButtonElement | null = null;
let currentURL = location.href;

let isVisible = false;

function createStickyNote() {
  stickyContainer = document.createElement("div");
  stickyContainer.className = "stinky-note";
  stickyContainer.style.display = "none";
  stickyContainer.onclick = (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  closeButton = document.createElement("button");
  closeButton.className = "stinky-note-close";
  closeButton.innerText = "✕";
  closeButton.onclick = () => {
    toggleNote(false);
  };
  stickyContainer.appendChild(closeButton);

  textArea = document.createElement("textarea");
  textArea.className = "stinky-note-textarea";
  textArea.placeholder = "Type your note here...";

  textArea.onfocus = (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  textArea.oninput = async () => {
    if (textArea) {
      const noteContent = textArea.value.trim();
      if (noteContent.length > 0) {
        await chrome.storage.local.set({
          [storageKey(currentURL)]: noteContent,
        });
      } else {
        await chrome.storage.local.remove(storageKey(currentURL));
      }
    }
  };

  stickyContainer.appendChild(textArea);
  document.body.appendChild(stickyContainer);
}

async function toggleNote(forceVisible?: boolean) {
  if (!stickyContainer || !textArea) return;

  if (typeof forceVisible === "boolean") {
    isVisible = forceVisible;
  } else {
    isVisible = !isVisible;
  }

  stickyContainer.style.display = isVisible ? "block" : "none";

  if (!isVisible) return;

  const key = storageKey(currentURL);
  const data = await chrome.storage.local.get(key);
  const noteContent = data[key] || "";
  textArea.value = noteContent;
}

async function checkForNote() {
  const key = storageKey(currentURL);
  const data = await chrome.storage.local.get(key);
  const noteContent = data[key] || "";

  if (noteContent) {
    await toggleNote(true);
    updateIcon(true);
  } else {
    updateIcon(false);
  }
}

function updateIcon(hasNote: boolean) {
  chrome.runtime.sendMessage({
    type: "UPDATE_ICON",
    payload: { hasNote },
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TOGGLE_NOTE") {
    toggleNote();
  }
});

window.addEventListener("load", async () => {
  createStickyNote();
  await checkForNote();
});
