import {
  groupTabsByDomain,
  findDuplicateTabs
} from './utils.js';

chrome.commands.onCommand.addListener(async (command) => {
  try {
    switch (command) {
      case 'organize-tabs':
        const tabs = await chrome.tabs.query({ currentWindow: true });
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
        break;

      case 'remove-duplicates':
        const currentTabs = await chrome.tabs.query({ currentWindow: true });
        const duplicates = findDuplicateTabs(currentTabs);
        if (duplicates.length > 0) {
          await chrome.tabs.remove(duplicates.map(tab => tab.id));
        }
        break;

      case 'merge-windows':
        const currentWindow = await chrome.windows.getCurrent();
        const windows = await chrome.windows.getAll();

        for (const window of windows) {
          if (window.id !== currentWindow.id) {
            const tabs = await chrome.tabs.query({
              windowId: window.id
            });

            for (const tab of tabs) {
              await chrome.tabs.move(tab.id, {
                windowId: currentWindow.id,
                index: -1 // Append to the end
              });
            }
          }
        }
        break;
    }
  } catch (error) {
    console.error('Error executing command:', command, error);
  }
});