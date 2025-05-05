// Utility to slightly lighten/darken colors
function adjustColor(hex, amount) {
    return '#' + hex.replace(/^#/, '')
      .replace(/../g, color =>
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2)
      );
  }
  
  const lineColors = {
    red: "#FF4D4D",        // Brighter red
    blue: "#4D7AFF",       // Brighter blue
    green: "#66CC66",      // Single green for all green lines
    "green-b": "#66CC66",  // same as green
    "green-c": "#66CC66",  // same as green
    "green-d": "#66CC66",  // same as green
    "green-e": "#66CC66",  // same as green
    orange: "#FFD280"      // Light orange
  };
  
  