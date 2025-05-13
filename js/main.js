const map = L.map('map', {
    zoomControl: false // disable default position
}).setView([42.3601, -71.0589], 13);

const mbtaLines = {};
let stationLayer = null;
let allStationData = null; // Cached GeoJSON
let stationClusterGroup = null;
const allMarkers = []; // Global array to store all restaurant markers

console.log('AwesomeMarkers:', L.AwesomeMarkers);

// Add zoom control manually to bottom right
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
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
        const matchesCuisine = selectedCuisines.length === 0 || selectedCuisines.includes(marker.meta.cuisine);

        // Add or remove marker based on matches
        if (matchesLine && matchesCuisine) {
            if (!map.hasLayer(marker)) map.addLayer(marker);
        } else {
            map.removeLayer(marker);
        }
    });
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

    // ✅ Re-create and assign cluster group globally
    stationClusterGroup = L.markerClusterGroup();

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
        <div style="font-size: 14px; font-weight: bold;">${place.name}</div>
        <p>${place.review}</p>
        <a href="${place.website}" target="_blank">Visit website</a>
    `;
}

fetch('data/restaurants.json')
  .then(res => res.json())
  .then(data => {
    const markers = [];

    data.forEach(place => {
      const icon = L.AwesomeMarkers.icon({
        icon: 'utensils',
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

      // Lowercased string for searching
      marker.searchText = `${place.name} ${place.cuisine} ${place.line}`.toLowerCase();

      markers.push(marker);
      allMarkers.push(marker); // Add to global list for filtering
    });

    const markerLayer = L.layerGroup(markers); // DO NOT add to map here if filtering handles that
    map.addLayer(markerLayer); // You can choose to control visibility elsewhere

    const searchControl = new L.Control.Search({
        layer: null, // Disables automatic indexing
        sourceData: function (text, callResponse) {
            console.log('SEARCH FIRED:', text);
            const results = [];
    
            markerLayer.eachLayer(marker => {
                if (marker.searchText?.toLowerCase().includes(text.toLowerCase())) {
                    const latlng = marker.getLatLng();
                    if (latlng) {
                        console.log('LatLng found:', latlng);
                        results.push({
                            name: marker.searchText,
                            latlng: latlng,
                            layer: marker
                        });
                    }
                }
            });
    
            console.log('Search Results:', results); // Log search results for debugging
            callResponse(results); // Ensure that results are passed to the search control
        },
        propertyName: '', // ✅ Fixes the split error
        marker: false, // Don't show markers for search results
        textPlaceholder: 'Search...', // Custom placeholder
        moveToLocation: function (latlng, title, map) {
            console.log('moveToLocation triggered for latlng:', latlng);
            
            if (latlng) {
                // Use flyTo for smooth transition
                map.flyTo(latlng, 16); // Fly to the latlng at zoom level 16
                console.log('Flying to:', latlng);
    
                // Try opening the popup of the found marker as well
                const foundMarker = markerLayer.getLayers().find(marker => marker.getLatLng().equals(latlng));
                if (foundMarker) {
                    foundMarker.openPopup(); // Optionally open the popup
                    console.log('Opened popup for marker');
                } else {
                    console.log('No marker found for this latlng:', latlng);
                }
            } else {
                console.log('No valid latlng found');
            }
        }
    });
    
    // Add the search control to the map
    map.addControl(searchControl);
    
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

map.options.zoomAnimation = true; // Enable smooth zoom transitions
