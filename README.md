# 🎲 Dicer - Smart Dice Roller

A lightweight, elegant, and feature-rich dice rolling application built with vanilla JavaScript, HTML5, and CSS3. Perfect for tabletop gaming, probability experiments, and random number generation.

![Dicer Banner](https://img.shields.io/badge/Version-1.0.0-blue) 
![License](https://img.shields.io/badge/License-MIT-green) 
![Size](https://img.shields.io/badge/Size-47kb-orange)

---

## ✨ Features

### 🎯 Core Functionality
- **Multiple Dice Types**: Support for D4, D6, D8, D10, D12, D20, and D100
- **Configurable Count**: Roll 1-12 dice simultaneously
- **Dual Display Modes**: View results as total sum or individual dice values
- **Instant Results**: Lightning-fast calculations with smooth animations

### 🎲 Advanced RNG Modes
- **Random Mode**: Standard pseudorandom number generation using `Math.random()`
- **Balanced Mode**: Deck/bag-based system ensuring perfect uniform distribution over time
  - Uses Fisher-Yates shuffle algorithm
  - Guarantees every outcome appears before reshuffling

### 👥 Multiplayer Support
- **2-8 Players**: Turn-based rolling system
- **Player Tracking**: Visual indicator showing current player
- **Individual Statistics**: Track performance per player
- **Manual Selection**: Jump to any player's turn

### 📊 Statistics & Analytics
- **Dice Statistics**: Frequency distribution of individual die values
- **Total Statistics**: Distribution of sum totals across rolls
- **Visual Bar Charts**: Clean, gradient-filled SVG charts with X/Y axes
- **Per-Player Stats**: Filter statistics by player in multiplayer mode
- **Real-time Averages**: Automatic calculation of mean values

### 📜 History Tracking
- **50-Roll History**: Stores last 50 rolls with timestamps
- **Player Attribution**: Shows which player made each roll
- **Detailed View**: See individual dice values and totals

### 🎨 Theme Support
- **Light Mode**: Clean, bright interface with soft shadows
- **Dark Mode**: Easy on the eyes with high contrast
- **Persistent Storage**: Theme preference saved locally
- **Instant Toggle**: One-click theme switching

### 🔊 Audio Feedback
- **Synthesized Sound**: Web Audio API for dice roll sound effects
- **No External Files**: Pure JavaScript audio synthesis

---

## 🚀 Live Version

Find the live version at [https://iamyvj.github.io/Dicer/](https://iamyvj.github.io/Dicer/)

---

## 🎮 Usage Guide

### Basic Rolling
1. Open the application in your browser
2. Click the large **"Roll Dice"** button in the center
3. View your result displayed as a large number (total) or individual dice

### Accessing Configuration
1. **Scroll down** below the roll button to reveal the configuration panel
2. All settings are organized into collapsible sections

### Dice Configuration
- **Number of Dice**: Use the slider to select 1-12 dice
  - Real-time value display shows current selection
- **Dice Type**: Select from dropdown menu
  - D4, D6, D8, D10, D12, D20, D100

### Display & RNG Modes
- **Display Mode**:
  - **Total**: Shows sum of all dice as one large number
  - **Individual**: Shows each die result separately in a grid
- **RNG Mode**:
  - **Random**: Standard random generation
  - **Balanced**: Ensures uniform distribution using deck system

### Multiplayer Setup
1. Check **"Enable Multiplayer"** in the Multiplayer panel
2. Use slider to set number of players (2-8)
3. Player list appears below showing all participants
4. Current player is highlighted with accent color
5. Roll button automatically advances to next player after each roll
6. Use **"Select"** buttons to manually choose active player

### Viewing Statistics
1. Click **📊 Statistics** button in the Actions panel
2. Choose statistics type:
   - **Dice Statistics**: Distribution of individual die face values
   - **Total Statistics**: Distribution of sum totals
3. View bar chart with:
   - X-axis: Values rolled
   - Y-axis: Number of occurrences
   - Value labels on each bar
4. Check summary showing:
   - Total number of rolls
   - Average value
5. In multiplayer: Select specific player from dropdown to view their stats

### Roll History
1. Click **📜 History** button
2. Browse chronological list of last 50 rolls
3. Each entry shows:
   - Timestamp
   - Player name (if multiplayer)
   - Individual dice values
   - Total sum

### Theme Switching
1. Click sun/moon icon in top-right corner
2. Theme toggles between light and dark
3. Preference is saved automatically

### Reset Session
1. Click **🔄 Reset** button
2. Confirm the action
3. Clears all statistics and history
4. Dice configuration is preserved

---

## 🛠️ Technical Details

### Tech Stack
- **HTML5**: Semantic markup, accessible design
- **CSS3**: CSS variables, Flexbox, Grid, responsive media queries
- **Vanilla JavaScript (ES6+)**: No frameworks or libraries

### Performance
- **Total Size**: 47.3kb (uncompressed)
- **Load Time**: <200ms
- **Animation**: 0.3s simple fade/scale
- **60fps**: Smooth on all devices

### Browser Support
Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, Mobile browsers

### Responsive Breakpoints
- **Mobile**: 360px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+
- **TV/4K**: 2560px+

### Key Features
- **Balanced RNG**: Fisher-Yates shuffle for uniform distribution
- **Dynamic SVG Charts**: Generated client-side, no libraries
- **Web Audio API**: Synthesized sound effects
- **LocalStorage**: Persistent theme preferences
- **State Management**: Centralized state object

---

## 👨‍💻 Developer

**Yashvardhan Jain**

🌐 Portfolio: [iamyvj.github.io](https://iamyvj.github.io/)

---

<div align="center">

**© 2026 Dicer. All rights reserved.**

Developed by [Yashvardhan Jain](https://iamyvj.github.io/)

</div>
