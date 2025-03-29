// Utility functions for tab processing
export function getMainDomain(hostname) {
  const parts = hostname.split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
}

export function getTabUrl(tab) {
  try {
    return new URL(tab.url);
  } catch (error) {
    console.error('Error processing tab URL:', tab, error);
    return null;
  }
}

export function getTabMainDomain(tab) {
  const url = getTabUrl(tab);
  return url ? getMainDomain(url.hostname) : 'unknown';
}

export function groupTabsByDomain(tabs) {
  const groups = {};
  tabs.forEach(tab => {
    const mainDomain = getTabMainDomain(tab);
    if (!groups[mainDomain]) {
      groups[mainDomain] = [];
    }
    groups[mainDomain].push(tab);
  });
  return groups;
}

export function findDuplicateTabs(tabs) {
  const seenUrls = new Map();
  const duplicates = [];

  tabs.forEach(tab => {
    const url = getTabUrl(tab);
    if (url) {
      const urlString = url.href;
      if (!seenUrls.has(urlString)) {
        seenUrls.set(urlString, tab);
      } else {
        duplicates.push(tab);
      }
    }
  });

  return duplicates;
}

export function showFeedback(message) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = message;
  feedback.classList.add('show');

  setTimeout(() => {
    feedback.classList.remove('show');
  }, 2000);
}

// Store domain colors
const domainColors = new Map();

export function getColorForDomain(domain) {
  const mainDomain = getMainDomain(domain);
  if (!domainColors.has(mainDomain)) {
    const colors = ['#e3f2fd', '#e8f5e9'];
    const colorIndex = domainColors.size % 2;
    domainColors.set(mainDomain, colors[colorIndex]);
  }
  return domainColors.get(mainDomain);
}