const map = L.map('map', {
    zoomControl: false // disable default position
}).setView([42.3601, -71.0589], 13);

const miniMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ''
  });

const mbtaLines = {};
let stationLayer = null;
let allStationData = null; // Cached GeoJSON
let stationClusterGroup = null;
const allMarkers = []; // Global array to store all restaurant markers

const cuisineIconMap = {
    italian: 'pizza-slice',
    chinese: 'utensils',
    japanese: 'fish',
    mexican: 'pepper-hot',
    indian: 'burn',
    american: 'hamburger',
    burgers: 'hamburger',
    thai: 'leaf',
    french: 'wine-glass',
    default: 'utensils' // fallback icon
  };

// Add OpenStreetMap base layer
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; OpenStreetMap contributors'
// }).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap & CartoDB'
  }).addTo(map);

function addMBTALine(geojsonUrl, color, lineName) {
    fetch(geojsonUrl)
        .then(res => res.json())
        .then(data => {
            const layer = L.geoJSON(data, {
                style: {
                    color: color,
                    weight: 5,
                    opacity: 0.8
                }
            });

            mbtaLines[lineName] = layer;
            layer.addTo(map); // Optionally add all by default
        });
}

addMBTALine('mbta/red_line.geojson', '#DA291C', 'Red');
addMBTALine('mbta/mattapan_trolley.geojson', '#DA291C', 'Mattapan');
addMBTALine('mbta/orange_line.geojson', '#ED8B00', 'Orange');
addMBTALine('mbta/green_line.geojson', '#00843D', 'Green');
addMBTALine('mbta/blue_line.geojson', '#003DA5', 'Blue');
addMBTALine('mbta/silver_line.geojson', '#A5A5A5', 'Silver');

fetch('data/mbta-stations.geojson')
    .then(res => res.json())
    .then(data => {
        allStationData = data;
        filterLines(); // Build initial layer from same data
    });

function filterMarkers() {
    // Get selected line filters
    const selectedLines = Array.from(document.querySelectorAll('input[name="line"]:checked')).map(i => i.value);

    // Get selected cuisine filters
    const selectedCuisines = Array.from(document.querySelectorAll('input[name="cuisine"]:checked')).map(i => i.value);

    allMarkers.forEach(marker => {
        // Check if the marker matches the selected lines and cuisines
        const matchesLine = selectedLines.length === 0 || selectedLines.some(line => marker.meta.line.toLowerCase().includes(line.toLowerCase()));
        const matchesCuisine = selectedCuisines.length === 0 || selectedCuisines.some(cuisine => marker.meta.cuisine.toLowerCase().includes(cuisine.toLowerCase()));

        // Add or remove marker based on matches
        if (matchesLine && matchesCuisine) {
            if (!map.hasLayer(marker)) map.addLayer(marker);
        } else {
            map.removeLayer(marker);
        }
    });
}

function getHexColor(lineColor) {
    const colors = {
        red: '#DA291C',
        orange: '#ED8B00',
        green: '#00843D',
        blue: '#003DA5',
        lightgray: '#A5A5A5',
        gray: '#A5A5A5',
        default: '#666'
    };

    return colors[lineColor.toLowerCase()] || colors.default;
}

function filterLines() {
    const selectedLines = Array.from(document.querySelectorAll('input[name="line"]:checked'))
        .map(i => i.value.toLowerCase());

    Object.entries(mbtaLines).forEach(([lineName, layer]) => {
        if (selectedLines.length === 0 || selectedLines.includes(lineName.toLowerCase())) {
            if (!map.hasLayer(layer)) map.addLayer(layer);
        } else {
            map.removeLayer(layer);
        }
    });

    // 🔴 Remove previous cluster group if it exists
    if (stationClusterGroup) {
        map.removeLayer(stationClusterGroup);
    }

    if (!allStationData) return;

    const filtered = {
        type: "FeatureCollection",
        features: allStationData.features.filter(feature => {
            const stationLines = (feature.properties.lines || []).map(line => line.toLowerCase());
            return selectedLines.length === 0 || stationLines.some(line => selectedLines.includes(line));
        })
    };

    stationClusterGroup = L.markerClusterGroup({
        iconCreateFunction: function (cluster) {
            const children = cluster.getAllChildMarkers();
            const colorCounts = {};
    
            // Count marker colors
            children.forEach(marker => {
                const line = marker.options.icon.options.markerColor || 'blue';
                colorCounts[line] = (colorCounts[line] || 0) + 1;
            });
    
            // Get the most common color
            const dominantColor = Object.entries(colorCounts)
                .sort((a, b) => b[1] - a[1])[0][0];
    
            // Return a custom cluster icon with that color
            return L.divIcon({
                html: `<div style="background-color:${getHexColor(dominantColor)};" class="marker-cluster"><span>${cluster.getChildCount()}</span></div>`,
                className: 'custom-cluster-icon',
                iconSize: L.point(40, 40)
            });
        }
    });
    

    stationLayer = L.geoJSON(filtered, {
        pointToLayer: function (feature, latlng) {
            const line = feature.properties.lines?.[0]?.toLowerCase() || 'blue';
            const icon = getMarkerIcon(line);
            return L.marker(latlng, { icon });
        },
        onEachFeature: function (feature, layer) {
            const name = feature.properties.name || "Unknown Station";
            const lines = Array.isArray(feature.properties.lines) ? feature.properties.lines.join(", ") : "Unknown lines";
            layer.bindPopup(`<strong>${name}</strong><br>Lines: ${lines}`);
        }
    });

    stationClusterGroup.addLayer(stationLayer);
    map.addLayer(stationClusterGroup);
}

function getMarkerIcon(line) {
    let iconColor = 'blue'; // Default color if no match found

    // Convert the line name to lowercase for case-insensitive comparison
    const lineLower = line.toLowerCase();

    // Check if the line name contains any color string
    if (lineLower.includes('red')) {
        iconColor = 'red';
    } else if (lineLower.includes('orange')) {
        iconColor = 'orange';
    } else if (lineLower.includes('green')) {
        iconColor = 'green';
    } else if (lineLower.includes('blue')) {
        iconColor = 'blue';
    } else if (lineLower.includes('silver') || lineLower.includes('sl')) {
        iconColor = 'lightgray';
    }

    // Return AwesomeMarker icon with the selected color
    return L.AwesomeMarkers.icon({
        icon: 'fa-train', // Font Awesome 'train' icon class
        markerColor: iconColor, // Set the color based on the line
        iconColor: 'white', // Color of the icon itself (white for contrast)
        prefix: 'fa' // Font Awesome prefix
    });
}

function getPopupContent(place) {
    return `
        <div class="popup-card">
        <h4>${place.name}</h4>
        <p><strong>Cuisine:</strong> ${place.cuisine}</p>
        <p><strong>Line:</strong> ${place.line}</p>
        <a href="${place.website}" target="_blank">Visit website</a>
        </div>
    `;
}

fetch('data/restaurants.json')
  .then(res => res.json())
  .then(data => {
    const markers = [];

    data.forEach(place => {
      const cuisineStr = place.cuisine.toLowerCase();

      // Try to find the first matching cuisine type
      let matched = cuisineIconMap['default'];
      for (const key in cuisineIconMap) {
        if (cuisineStr.includes(key)) {
          matched = cuisineIconMap[key];
          break;
        }
      }

      const icon = L.AwesomeMarkers.icon({
        icon:  matched,
        markerColor: 'purple',
        iconColor: 'white',
        prefix: 'fa'
      });

      const marker = L.marker([place.lat, place.lng], { icon });
      marker.bindPopup(getPopupContent(place));

      marker.meta = {
        line: place.line,
        cuisine: place.cuisine
      };

      marker.searchText = `${place.name} ${place.cuisine} ${place.line}`.toLowerCase();

      markers.push(marker);
      allMarkers.push(marker);
    });

    const markerLayer = L.layerGroup(markers);
    map.addLayer(markerLayer);
  });


document.querySelectorAll('input[name="line"]').forEach(input => {
    input.addEventListener('change', () => {
        filterMarkers(); // Update restaurant markers
        filterLines(); // Update MBTA lines
    });
});

document.querySelectorAll('input[name="cuisine"]').forEach(input => {
    input.addEventListener('change', () => {
        filterMarkers(); // Update restaurant markers based on the selected filters
    });
});

document.getElementById('toggle-btn').addEventListener('click', function() {
    const filterPanel = document.getElementById('filter-panel');
    filterPanel.classList.toggle('open');
  });

map.options.zoomAnimation = true; // Enable smooth zoom transitions
const locateControl = L.control.locate({
    position: 'bottomright', // You can adjust this to 'topright', 'bottomleft', etc.
    strings: {
        title: "Show me where I am"
    }
}).addTo(map);

L.control.fullscreen({
    position: 'topright', // You can adjust this to bottomleft, etc.
    title: 'Show fullscreen',
    titleCancel: 'Exit fullscreen',
}).addTo(map);

L.control.zoom({
    position: 'topleft'
}).addTo(map);

const miniMap = new L.Control.MiniMap(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'), {
    position: 'bottomleft', // Controls where the MiniMap is located
    width: 150,
    height: 150,
}).addTo(map);