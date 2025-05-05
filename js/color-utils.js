// Utility to slightly lighten/darken colors
function adjustColor(hex, amount) {
    return '#' + hex.replace(/^#/, '')
      .replace(/../g, color =>
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2)
      );
  }
  
  const lineColors = {
    red: "#FF9999",        // soft red
    blue: "#9999FF",       // soft blue
    green: "#33A533",      // still good for contrast
    "green-b": "#66BB66",  // lighter
    "green-c": "#66CC66",  // lighter
    "green-d": "#99EE99",  // lighter lime
    "green-e": "#AADD99",  // pastel green
    orange: "#FFD280"      // lighter orange
  };
  