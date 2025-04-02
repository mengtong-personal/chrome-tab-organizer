import {
  getTabMainDomain,
  groupTabsByDomain,
  findDuplicateTabs,
  showFeedback,
  getColorForDomain
} from './utils.js';

let currentTabs = [];
let currentWindowId = null;

async function refreshTabs() {
  const currentWindow = await chrome.windows.getCurrent();
  currentWindowId = currentWindow.id;
  currentTabs = await chrome.tabs.query({ currentWindow: true });
  return currentTabs;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    currentTabs = await refreshTabs();
    updateStats(currentTabs);

    // Add event listeners to buttons
    document.getElementById('groupByDomain').addEventListener('click', async () => {
      try {
        await reorderTabsByDomain(currentTabs);
        showFeedback('Tabs organized by domain');
      } catch (error) {
        console.error('Error reordering by domain:', error);
      }
    });

    document.getElementById('removeDuplicates').addEventListener('click', async () => {
      try {
        await removeDuplicateTabs(currentTabs);
        showFeedback('Duplicate tabs removed');
      } catch (error) {
        console.error('Error removing duplicates:', error);
      }
    });

    document.getElementById('moveToCurrentWindow').addEventListener('click', async () => {
      try {
        const movedCount = await moveTabsToCurrentWindow();
        showFeedback(`Moved ${movedCount} tabs`);
      } catch (error) {
        console.error('Error moving tabs:', error);
      }
    });

    await displayExistingGroups();
  } catch (error) {
    console.error('Error in initialization:', error);
  }
});

async function removeDuplicateTabs(tabs) {
  try {
    const duplicates = findDuplicateTabs(tabs);
    if (duplicates.length > 0) {
      await chrome.tabs.remove(duplicates.map(tab => tab.id));
      currentTabs = await refreshTabs();
    }
    await displayExistingGroups();
  } catch (error) {
    console.error('Error in removeDuplicateTabs:', error);
    throw error;
  }
}

async function reorderTabsByDomain(tabs) {
  try {
    const pinnedTabs = tabs.filter(tab => tab.pinned);
    const unpinnedTabs = tabs.filter(tab => !tab.pinned);
    const groups = groupTabsByDomain(unpinnedTabs);

    // Reorder tabs by domain
    let currentIndex = pinnedTabs.length;
    for (const domainTabs of Object.values(groups)) {
      for (const tab of domainTabs) {
        try {
          await chrome.tabs.move(tab.id, { index: currentIndex++ });
        } catch (error) {
          console.error('Error moving tab:', tab, error);
        }
      }
    }

    currentTabs = await refreshTabs();
    await displayExistingGroups();
  } catch (error) {
    console.error('Error in reorderTabsByDomain:', error);
    throw error;
  }
}

async function displayExistingGroups() {
  const groupsList = document.getElementById('groupsList');
  groupsList.innerHTML = '';

  const unpinnedTabs = currentTabs.filter(tab => !tab.pinned);
  const groups = groupTabsByDomain(unpinnedTabs);

  // Sort and display groups
  const sortedGroups = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  
  for (const [mainDomain, domainTabs] of sortedGroups) {
    const groupElement = document.createElement('div');
    groupElement.className = 'group-item';
    groupElement.style.cursor = 'pointer';
    groupElement.innerHTML = `
      <div class="group-header" style="background-color: ${getColorForDomain(mainDomain)}">
        <span>${mainDomain}</span>
        <span class="tab-count">${domainTabs.length} tabs</span>
      </div>
    `;

    groupElement.addEventListener('click', async () => {
      try {
        const firstTab = domainTabs[0];
        if (firstTab) {
          await chrome.tabs.update(firstTab.id, { active: true });
          await chrome.windows.update(firstTab.windowId, { focused: true });
        }
      } catch (error) {
        console.error('Error focusing tab:', error);
      }
    });

    groupsList.appendChild(groupElement);
  }

  updateStats(currentTabs);
}

function updateStats(tabs) {
  document.getElementById('totalTabs').textContent = tabs.length;
  const unpinnedTabs = tabs.filter(tab => !tab.pinned);
  document.getElementById('totalGroups').textContent = new Set(unpinnedTabs.map(tab => getTabMainDomain(tab))).size;
}

async function moveTabsToCurrentWindow() {
  try {
    // Get all windows
    const windows = await chrome.windows.getAll();
    let movedCount = 0;

    // For each window that's not the current window
    for (const window of windows) {
      if (window.id !== currentWindowId) {
        // Get all tabs from that window (including pinned)
        const tabs = await chrome.tabs.query({
          windowId: window.id
        });

        // Move each tab to the current window
        for (const tab of tabs) {
          await chrome.tabs.move(tab.id, {
            windowId: currentWindowId,
            index: -1 // Append to the end
          });
          movedCount++;
        }
      }
    }

    // Refresh the current tabs list
    currentTabs = await refreshTabs();
    await displayExistingGroups();
    return movedCount;
  } catch (error) {
    console.error('Error moving tabs:', error);
    throw error;
  }
}