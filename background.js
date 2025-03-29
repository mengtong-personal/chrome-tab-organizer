import {
  groupTabsByDomain,
  findDuplicateTabs
} from './utils.js';

chrome.commands.onCommand.addListener(async (command) => {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    if (command === 'organize-tabs') {
      await reorderTabsByDomain(tabs);
    } else if (command === 'remove-duplicates') {
      await removeDuplicateTabs(tabs);
    }
  } catch (error) {
    console.error('Error handling keyboard command:', error);
  }
});

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
  } catch (error) {
    console.error('Error in reorderTabsByDomain:', error);
  }
}

async function removeDuplicateTabs(tabs) {
  try {
    const duplicates = findDuplicateTabs(tabs);
    if (duplicates.length > 0) {
      await chrome.tabs.remove(duplicates.map(tab => tab.id));
    }
  } catch (error) {
    console.error('Error in removeDuplicateTabs:', error);
  }
}