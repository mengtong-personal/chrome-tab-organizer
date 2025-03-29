document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get all tabs in the current window
    const tabs = await chrome.tabs.query({ currentWindow: true });
    console.log('Found tabs:', tabs);
    updateStats(tabs);

    // Add event listener to button
    document.getElementById('groupByDomain').addEventListener('click', async () => {
      try {
        console.log('Reordering by domain...');
        await reorderTabsByDomain(tabs);
      } catch (error) {
        console.error('Error reordering by domain:', error);
      }
    });

    // Display existing groups
    await displayExistingGroups();
  } catch (error) {
    console.error('Error in initialization:', error);
  }
});

// Store domain colors
const domainColors = new Map();

function getMainDomain(hostname) {
  const parts = hostname.split('.');
  if (parts.length > 2) {
    // For domains like mail.google.com, return google.com
    return parts.slice(-2).join('.');
  }
  return hostname;
}

function getColorForDomain(domain) {
  const mainDomain = getMainDomain(domain);
  if (!domainColors.has(mainDomain)) {
    // Use alternating colors: light blue and light green
    const colors = ['#e3f2fd', '#e8f5e9'];
    const colorIndex = domainColors.size % 2;
    domainColors.set(mainDomain, colors[colorIndex]);
  }
  return domainColors.get(mainDomain);
}

async function reorderTabsByDomain(tabs) {
  try {
    // Separate pinned and unpinned tabs
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

    console.log('Created groups:', groups);

    // Reorder tabs by domain
    let currentIndex = pinnedTabs.length; // Start after pinned tabs
    for (const [mainDomain, domainTabs] of Object.entries(groups)) {
      for (const tab of domainTabs) {
        try {
          await chrome.tabs.move(tab.id, {
            index: currentIndex
          });
          currentIndex++;
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

  // Group tabs by main domain for display
  const groups = {};
  tabs.forEach(tab => {
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

  // Display groups
  for (const [mainDomain, domainTabs] of Object.entries(groups)) {
    const groupElement = document.createElement('div');
    groupElement.className = 'group-item';
    groupElement.innerHTML = `
      <div class="group-header" style="background-color: ${getColorForDomain(mainDomain)}">
        <span>${mainDomain}</span>
        <span class="tab-count">${domainTabs.length} tabs</span>
      </div>
    `;
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