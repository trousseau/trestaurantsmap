// Utility to slightly lighten/darken colors
function adjustColor(hex, amount) {
    return '#' + hex.replace(/^#/, '')
      .replace(/../g, color =>
        ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2)
      );
  }
  
  const lineColors = {
    red: "#FF6666",       // lighter red
    blue: "#6666FF",      // lighter blue
    green: "#33A533",     // lighter green
    "green-b": "#339933", // lighter dark green
    "green-c": "#44AA44", // lighter forest green
    "green-d": "#66DD66", // lighter lime green
    "green-e": "#88CC88", // lighter mint green
    orange: "#FFB84D"     // lighter orange
  };  