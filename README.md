# Chrome Tab Organizer

A Chrome extension that helps you organize your tabs efficiently by grouping them by domain and removing duplicates.

## Features

- **Reorder Tabs by Domain**: Automatically reorders tabs by their main domain in the current window.
- **Remove Duplicates**: Identifies and removes duplicate tabs.
- **Merge Windows**: Move all tabs from other windows to the current window.
- **Visual Tab Groups**: Displays tabs grouped by domain in the popup, showing tab counts and allowing quick actions.
- **Move Group to New Window**: Quickly move all tabs of a specific domain (from the visual groups) to a new window.
- **Close Tab Group**: Close all tabs belonging to a specific domain group (from the visual groups).
- **Keyboard Shortcuts**: Quick access to some features (reorder, dedup, merge).

## Installation

1. Clone this repository or download the source code
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

### Button Interface
The popup provides several actions:
- Click **"Group by Domain"** to reorder all tabs in the current window by their main domain.
- Click **"Remove Duplicates"** to find and close duplicate tabs in the current window.
- Click **"Move Tabs to Current Window"** to consolidate all tabs from other open windows into your current window.

The popup also displays a list of your current tab groups:
- Each group shows the main domain and the number of tabs in that group.
- Groups are sorted by the number of tabs, largest first.
- Clicking on a group header will focus the first tab of that group.
- Each group has two action buttons:
    - **'↗' (Move to new window)**: Moves all tabs in that specific group to a brand new window.
    - **'✕' (Close group)**: Closes all tabs in that specific group.

### Keyboard Shortcuts
- `Command+Shift+8` (Mac) / `Ctrl+Shift+8` (Windows/Linux): Organize tabs by domain
- `Command+Shift+9` (Mac) / `Ctrl+Shift+9` (Windows/Linux): Remove duplicate tabs
- `Command+Shift+0` (Mac) / `Ctrl+Shift+0` (Windows/Linux): Merge all tabs from other windows

## Features in Detail

### Organize by Domain
- Groups tabs by their main domain (e.g., google.com, github.com)
- Preserves pinned tabs at the start
- Maintains tab order within each domain group (initially, then reorders all)
- This action reorders tabs within the *current window*.

### Remove Duplicates
- Identifies tabs with the same URL
- Keeps the first occurrence of each URL
- Removes all other duplicates

### Merge Windows
- Moves all tabs from other windows to the current window
- Preserves all tabs, including pinned ones
- Appends tabs to the end of the current window

### Visual Tab Groups & Actions
- The popup dynamically lists tab groups based on the main domain of unpinned tabs.
- **Group Display**: Each group item clearly shows the domain, its assigned color, and the count of tabs.
- **Focus Tab**: Clicking the main area of a group item will switch to the first tab of that group and focus its window.
- **Move Group to New Window**: A dedicated button ('↗') allows you to instantly move all tabs of that group into a new, separate window.
- **Close Tab Group**: A dedicated button ('✕') allows you to close all tabs belonging to that group.

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