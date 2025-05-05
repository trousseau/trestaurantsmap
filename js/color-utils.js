// Utility to slightly lighten/darken colors
function adjustColor(hex, amount) {
    return '#' + hex.replace(/^#/, '')
      .replace(/../g, color =>
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2)
      );
  }
  
  const lineColors = {
    red: "#FF4D4D",         // Bright red for Red Line
    mattapan: "#C71585",  // Deeper red for Mattapan Line
    blue: "#4D7AFF",        // Bright blue
    green: "#66CC66",       // Unified green for all Green Line branches
    "green-b": "#66CC66",
    "green-c": "#66CC66",
    "green-d": "#66CC66",
    "green-e": "#66CC66",
    "green-e-extension": "#66CC66",
    orange: "#FFB84D"       // Lighter orange
  };
  
  