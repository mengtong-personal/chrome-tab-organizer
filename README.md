# Chrome Tab Organizer

A Chrome extension that helps you organize your tabs efficiently by grouping them based on domain and removing duplicates.

## Features

- Organize tabs by domain (e.g., all GitHub tabs together)
- Remove duplicate tabs (keep only one instance of each URL)
- View statistics about your tabs and groups
- Modern, clean interface
- Color-coded groups for easy identification
- Click on any group to focus its first tab
- Preserves pinned tabs in their original position

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing these files

## Usage

1. Click the extension icon in your Chrome toolbar
2. Use the buttons to manage your tabs:
   - Click "Organize" to group tabs by domain (e.g., all GitHub tabs together)
   - Click "Deduplicate" to remove duplicate tabs, keeping only one instance of each URL
3. View your current groups and tab statistics in the popup
4. Click on any group to focus its first tab

## Features in Detail

### Tab Organization
- Tabs are grouped by their main domain (e.g., "mail.google.com" and "calendar.google.com" are grouped under "google.com")
- Groups are sorted by the number of tabs they contain
- Pinned tabs remain in their original position
- Groups are displayed with alternating light blue and light green backgrounds

### Duplicate Removal
- Removes duplicate tabs while keeping the first instance of each URL
- Only affects unpinned tabs
- Updates the display automatically after removal

### Group Navigation
- Click on any group to focus its first tab
- Groups show the number of tabs they contain
- Hover effects provide visual feedback for interactive elements

## Development

The extension is built using:
- HTML5
- CSS3
- JavaScript (ES6+)
- Chrome Extension APIs (tabs, storage)

## Permissions

This extension requires the following permissions:
- `tabs`: To access and manipulate browser tabs
- `storage`: To save extension settings
- `host_permissions`: To access tab URLs for domain grouping

## License

MIT License 