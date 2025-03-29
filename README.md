# Tab Organizer Chrome Extension

A Chrome extension that helps you organize your browser tabs efficiently by grouping them by domain and removing duplicates.

## Features

- **Domain-based Organization**: Automatically groups tabs by their main domain
- **Duplicate Removal**: Easily remove duplicate tabs with a single click
- **Visual Grouping**: Tabs from the same domain are visually grouped with color coding
- **Clickable Groups**: Click on any group to jump to the first tab of that domain
- **Keyboard Shortcuts**: Quick access to all features via keyboard shortcuts
- **Pinned Tab Support**: Preserves pinned tabs while organizing
- **Real-time Statistics**: Shows total tabs and unique domains

## Keyboard Shortcuts

- `Command+Shift+O` (Mac) or `Ctrl+Shift+O` (Windows/Linux): Open Tab Organizer popup
- `Command+Shift+9` (Mac) or `Ctrl+Shift+9` (Windows/Linux): Organize tabs by domain
- `Command+Shift+0` (Mac) or `Ctrl+Shift+0` (Windows/Linux): Remove duplicate tabs

You can customize these shortcuts in Chrome by visiting `chrome://extensions/shortcuts`.

## Installation

1. Clone this repository or download the source code
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar to open the popup
2. Use the "Organize" button to group tabs by domain
3. Use the "Deduplicate" button to remove duplicate tabs
4. Click on any group to jump to the first tab of that domain
5. Use keyboard shortcuts for quick access to features

## Development

The extension is built using vanilla JavaScript and Chrome Extension APIs. The main components are:

- `popup.html`: The extension's popup interface
- `popup.js`: Handles UI interactions and displays tab groups
- `background.js`: Manages keyboard shortcuts and background tasks
- `styles.css`: Styling for the popup interface

## Privacy

This extension only uses the necessary permissions to organize your tabs. It does not collect or transmit any personal data. All operations are performed locally in your browser.

## License

MIT License 