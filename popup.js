document.addEventListener('DOMContentLoaded', async () => {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    updateStats(tabs);

    // Add event listeners to buttons
    document.getElementById('groupByDomain').addEventListener('click', async () => {
      try {
        await reorderTabsByDomain(tabs);
        showFeedback('Tabs organized by domain');
      } catch (error) {
        console.error('Error reordering by domain:', error);
      }
    });

    document.getElementById('removeDuplicates').addEventListener('click', async () => {
      try {
        await removeDuplicateTabs(tabs);
        showFeedback('Duplicate tabs removed');
      } catch (error) {
        console.error('Error removing duplicates:', error);
      }
    });

    await displayExistingGroups();
  } catch (error) {
    console.error('Error in initialization:', error);
  }
});

function showFeedback(message) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = message;
  feedback.classList.add('show');
  
  // Hide the feedback after 2 seconds
  setTimeout(() => {
    feedback.classList.remove('show');
  }, 2000);
}

// Store domain colors
const domainColors = new Map();

function getMainDomain(hostname) {
  const parts = hostname.split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
}

function getColorForDomain(domain) {
  const mainDomain = getMainDomain(domain);
  if (!domainColors.has(mainDomain)) {
    const colors = ['#e3f2fd', '#e8f5e9'];
    const colorIndex = domainColors.size % 2;
    domainColors.set(mainDomain, colors[colorIndex]);
  }
  return domainColors.get(mainDomain);
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

    await displayExistingGroups();
  } catch (error) {
    console.error('Error in reorderTabsByDomain:', error);
    throw error;
  }
}

async function displayExistingGroups() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const groupsList = document.getElementById('groupsList');
  groupsList.innerHTML = '';

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

  updateStats(tabs);
}

function updateStats(tabs) {
  document.getElementById('totalTabs').textContent = tabs.length;
  const unpinnedTabs = tabs.filter(tab => !tab.pinned);
  document.getElementById('totalGroups').textContent = new Set(unpinnedTabs.map(tab => {
    try {
      return getMainDomain(new URL(tab.url).hostname);
    } catch (error) {
      return 'unknown';
    }
  })).size;
}