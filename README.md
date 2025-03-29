# Chrome Tab Organizer

A Chrome extension that helps you organize your tabs efficiently by grouping them based on domain or time accessed.

## Features

- Group tabs by domain (e.g., all GitHub tabs together)
- Group tabs by time accessed (Last 5 minutes, Last hour, Older)
- View statistics about your tabs and groups
- Modern, clean interface
- Color-coded groups for easy identification

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing these files

## Usage

1. Click the extension icon in your Chrome toolbar
2. Choose how you want to organize your tabs:
   - Click "Group by Domain" to group tabs from the same website together
   - Click "Group by Time" to group tabs based on when they were last accessed
3. View your current groups and tab statistics in the popup

## Development

The extension is built using:
- HTML5
- CSS3
- JavaScript (ES6+)
- Chrome Extension APIs (tabs, tabGroups, storage)

## Permissions

This extension requires the following permissions:
- `tabs`: To access and manipulate browser tabs
- `storage`: To save extension settings
- `tabGroups`: To create and manage tab groups

## License

MIT License 