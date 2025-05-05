// Utility to slightly lighten/darken colors
function adjustColor(hex, amount) {
    return '#' + hex.replace(/^#/, '')
      .replace(/../g, color =>
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2)
      );
  }
  
  // Export color map
  const lineColors = {
    red: "#FF0000",
    blue: "#0000FF",
    green: "#008000",
    "green-b": "#006400",
    "green-c": "#228B22",
    "green-d": "#32CD32",
    "green-e": "#66BB66",
    orange: "#FFA500"
  };
  