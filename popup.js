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
    const groupContainer = document.createElement('div');
    groupContainer.className = 'group-container';

    const groupElement = document.createElement('div');
    groupElement.className = 'group-item';
    groupElement.style.cursor = 'pointer';
    const groupColor = getColorForDomain(mainDomain);
    groupElement.innerHTML = `
      <div class="group-header" style="background-color: ${groupColor}">
        <span>${mainDomain}</span>
        <span class="tab-count">${domainTabs.length} tabs</span>
      </div>
    `;

    const moveButton = document.createElement('button');
    moveButton.className = 'group-btn';
    moveButton.title = 'Move to new window';
    moveButton.textContent = '↗';
    moveButton.style.backgroundColor = groupColor;

    const closeGroupButton = document.createElement('button');
    closeGroupButton.className = 'group-btn';
    closeGroupButton.title = 'Close this group';
    closeGroupButton.textContent = '✕';
    closeGroupButton.style.backgroundColor = groupColor;
    closeGroupButton.style.marginLeft = '5px';

    // Add click handler for the group header
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

    // Add click handler for the move button
    moveButton.addEventListener('click', async () => {
      try {
        await moveGroupToNewWindow(domainTabs);
        showFeedback(`Moved ${domainTabs.length} tabs to new window`);
      } catch (error) {
        console.error('Error moving group to new window:', error);
      }
    });

    // Add click handler for the close group button
    closeGroupButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      try {
        await closeTabGroup(domainTabs);
        showFeedback(`Closed ${domainTabs.length} tabs from ${mainDomain}`);
      } catch (error) {
        console.error('Error closing group:', error);
      }
    });

    groupContainer.appendChild(groupElement);
    groupContainer.appendChild(moveButton);
    groupContainer.appendChild(closeGroupButton);
    groupsList.appendChild(groupContainer);
  }

  updateStats(currentTabs);
}

async function moveGroupToNewWindow(tabs) {
  try {
    const currentTab = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTabId = currentTab[0]?.id;

    const nonCurrentTabsToMove = tabs.filter(tab => tab.id !== currentTabId);
    const currentTabToMove = tabs.filter(tab => tab.id === currentTabId);

    if (currentTabToMove.length == 0) {
      const newWindow = await chrome.windows.create({
        url: tabs[0].url
      });
      await chrome.tabs.remove(tabs[0].id);
      for (let i = 1; i < tabs.length; i++) {
        await chrome.tabs.move(tabs[i].id, {
          windowId: newWindow.id,
          index: -1 // Append to the end
        });
      }
    } else if (nonCurrentTabsToMove.length == 0) {
      await chrome.windows.create({
        url: currentTab.url
      });
      await chrome.tabs.remove(currentTab.id);
    } else {
      const newWindow = await chrome.windows.create({
        url: nonCurrentTabsToMove[0].url
      });
      await chrome.tabs.remove(nonCurrentTabsToMove[0].id);
      for (let i = 1; i < nonCurrentTabsToMove.length; i++) {
        await chrome.tabs.move(nonCurrentTabsToMove[i].id, {
          windowId: newWindow.id,
          index: -1 // Append to the end
        });
      }
      await chrome.tabs.move(currentTabId, {
        windowId: newWindow.id,
        index: -1 // Append to the end
      });
    }

    // Close the popup
    window.close();

    // Refresh the current tabs list
    currentTabs = await refreshTabs();
    await displayExistingGroups();
  } catch (error) {
    console.error('Error in moveGroupToNewWindow:', error);
    throw error;
  }
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

async function closeTabGroup(tabsToClose) {
  try {
    const tabIdsToClose = tabsToClose.map(tab => tab.id);
    if (tabIdsToClose.length > 0) {
      await chrome.tabs.remove(tabIdsToClose);
    }
    // Refresh the tabs list and UI
    currentTabs = await refreshTabs();
    await displayExistingGroups();
  } catch (error) {
    console.error('Error in closeTabGroup:', error);
    throw error; // Re-throw to be caught by the caller if necessary
  }
}