# Chrome Tab Organizer

A Chrome extension that helps you organize your tabs efficiently by grouping them by domain and removing duplicates.

## Features

- **Organize by Domain**: Automatically groups tabs by their main domain
- **Remove Duplicates**: Identifies and removes duplicate tabs
- **Merge Windows**: Move all tabs from other windows to the current window
- **Keyboard Shortcuts**: Quick access to all features

## Installation

1. Clone this repository or download the source code
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

### Button Interface
- Click "Organize" to group tabs by domain
- Click "Dedup" to remove duplicate tabs
- Click "Merge" to move all tabs from other windows to the current window

### Keyboard Shortcuts
- `Command+Shift+8` (Mac) / `Ctrl+Shift+8` (Windows/Linux): Organize tabs by domain
- `Command+Shift+9` (Mac) / `Ctrl+Shift+9` (Windows/Linux): Remove duplicate tabs
- `Command+Shift+0` (Mac) / `Ctrl+Shift+0` (Windows/Linux): Merge all tabs from other windows

## Features in Detail

### Organize by Domain
- Groups tabs by their main domain (e.g., google.com, github.com)
- Preserves pinned tabs at the start
- Maintains tab order within each domain group

### Remove Duplicates
- Identifies tabs with the same URL
- Keeps the first occurrence of each URL
- Removes all other duplicates

### Merge Windows
- Moves all tabs from other windows to the current window
- Preserves all tabs, including pinned ones
- Appends tabs to the end of the current window

## Development

The extension is built using vanilla JavaScript and Chrome Extension APIs. The code is organized into:

- `popup.html`: The extension's popup interface
- `popup.js`: Handles popup UI interactions
- `background.js`: Manages keyboard shortcuts and background tasks
- `utils.js`: Contains utility functions for tab management
- `styles.css`: Defines the extension's styling

## Privacy

This extension only uses the necessary permissions to organize your tabs. It does not collect or transmit any personal data. All operations are performed locally in your browser.

## License

MIT License 