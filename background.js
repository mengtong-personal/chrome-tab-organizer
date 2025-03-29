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

    // Group unpinned tabs by main domain
    const groups = {};
    unpinnedTabs.forEach(tab => {
      try {
        const url = new URL(tab.url);
        const mainDomain = getMainDomain(url.hostname);
        if (!groups[mainDomain]) {
          groups[mainDomain] = [];
        }
        groups[mainDomain].push(tab);
      } catch (error) {
        console.error('Error processing tab:', tab, error);
      }
    });

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
    const seenUrls = new Map();

    // Identify duplicates
    tabs.forEach(tab => {
      try {
        const url = new URL(tab.url).href;
        if (!seenUrls.has(url)) {
          seenUrls.set(url, tab);
        }
      } catch (error) {
        console.error('Error processing tab:', tab, error);
      }
    });

    // Close duplicate tabs
    const tabsToClose = tabs.filter(tab => {
      try {
        const url = new URL(tab.url).href;
        return seenUrls.get(url) !== tab;
      } catch (error) {
        return false;
      }
    });

    if (tabsToClose.length > 0) {
      await chrome.tabs.remove(tabsToClose.map(tab => tab.id));
    }
  } catch (error) {
    console.error('Error in removeDuplicateTabs:', error);
  }
}

function getMainDomain(hostname) {
  const parts = hostname.split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
}