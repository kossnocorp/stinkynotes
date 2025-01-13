let hasNote = false;
let isDarkMode = false;
let isVisible = false;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TOGGLE_NOTE") {
    toggleNote();
  }
});

setupThemeDetection();

window.addEventListener("load", async () => {
  const content = await loadNote();
  createStickyNote(content);
  updateIcon();
});

//#region DOM

let stickyContainer: HTMLDivElement | null = null;
let textArea: HTMLTextAreaElement | null = null;
let closeButton: HTMLButtonElement | null = null;
let currentURL = location.href;

function createStickyNote(content: string) {
  isVisible = !!content;

  stickyContainer = document.createElement("div");
  stickyContainer.className = "stinky-note";
  stickyContainer.style.display = isVisible ? "block" : "none";
  stickyContainer.onclick = (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  interceptEvents(stickyContainer);

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
  textArea.value = content;

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

  hasNote = !hasNote;

  updateIcon();

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

//#endregion

//#region Storage

async function loadNote() {
  const key = storageKey(currentURL);
  const data = await chrome.storage.local.get(key);
  const content: string = data[key] || "";

  hasNote = !!content;

  return content;
}

function storageKey(url: string): string {
  return `stinky-notes:${url}`;
}

//#endregion

//#region Events interception

const eventsToIntercept = [
  "focus",
  "focusin",
  "focusout",
  "blur",
  "mousedown",
  "mouseup",
  "click",
  "touchstart",
  "touchend",
  "pointerdown",
  "pointerup",
];

/**
 * Intercepts event on the document, to prevent websites from stealing focus
 * from the note textarea (e.g. when handling modal outside clicks).
 *
 * @param container - The surrounding note container
 */
function interceptEvents(container: HTMLElement) {
  eventsToIntercept.forEach((name) => {
    document.addEventListener(
      name,
      (e) => {
        if (container.contains(e.target as Node)) e.stopImmediatePropagation();
      },
      true
    );
  });
}

//#endregion

//#region Theme

function setupThemeDetection() {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  // Initial detection
  isDarkMode = media.matches;

  // Detect on theme change
  media.addEventListener("change", (e) => {
    isDarkMode = e.matches;
    updateIcon();
  });
}

//#endregion

//#region Icon

/**
 * Updates the icon based on the note presence and theme.
 */
function updateIcon() {
  if (hasNote) {
    // Use yellow icon if there's a note
    sendSetIcon("yellow");
  } else {
    // Otherwise, use the theme outline icon
    sendSetIcon(isDarkMode ? "outline-dark" : "outline-light");
  }
}

function sendSetIcon(icon: string) {
  chrome.runtime.sendMessage({
    type: "SET_ICON",
    payload: { icon },
  });
}

//#endregion
