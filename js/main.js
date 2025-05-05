// Initialize the map centered on Boston
const map = L.map('map').setView([42.3601, -71.0589], 13);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function addMBTALine(geojsonUrl, color) {
    fetch(geojsonUrl)
        .then(res => res.json())
        .then(data => {
            L.geoJSON(data, {
                style: function (feature) {
                    if (feature.properties.name === "Green Line Extension") {
                        return {
                            color: "#FF00FF", // Distinct color for testing
                            weight: 8,
                            opacity: 1
                        };
                    }
                    return {
                        color: color,
                        weight: 5,
                        opacity: 0.8
                    };
                }
            }).addTo(map);
        });
}


// Add MBTA subway lines with their respective colors
addMBTALine('mbta/red_line.geojson', '#DA291C');
addMBTALine('mbta/mattapan_trolley.geojson', '#DA291C');
addMBTALine('mbta/orange_line.geojson', '#ED8B00');
addMBTALine('mbta/green_line.geojson', '#00843D');
addMBTALine('mbta/blue_line.geojson', '#003DA5');
addMBTALine('mbta/silver_line.geojson', '#A5A5A5');

fetch('data/mbta-stations.geojson')
    .then(res => res.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                const primaryLine = feature.properties.lines[0];
                const baseColor = lineColors[primaryLine] || "#999999";
                const fill = adjustColor(baseColor, 30);

                // Return styled circle marker
                return L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: fill,
                    color: baseColor,
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                });
            },
            onEachFeature: function (feature, layer) {
                const name = feature.properties.name || "Unknown Station";
                const lines = Array.isArray(feature.properties.lines) ?
                    feature.properties.lines.join(", ") :
                    "Unknown lines";

                layer.bindPopup(`<strong>${name}</strong><br>Lines: ${lines}`);
            }
        }).addTo(map);
    });

fetch('data/mbta-stations.geojson')
    .then(res => res.json())
    .then(data => {
        // Log all features to inspect the structure
        data.features.forEach((feature) => {
            console.log('Feature Properties:', feature.properties);
            console.log('Geometry:', feature.geometry);
        });
    });


// Global array to store all restaurant markers
const allMarkers = [];

function filterMarkers() {
    const selectedLines = Array.from(document.querySelectorAll('input[name="line"]:checked')).map(i => i.value);
    const selectedCuisines = Array.from(document.querySelectorAll('input[name="cuisine"]:checked')).map(i => i.value);

    allMarkers.forEach(marker => {
        const matchesLine = selectedLines.length === 0 || selectedLines.includes(marker.meta.line);
        const matchesCuisine = selectedCuisines.length === 0 || selectedCuisines.includes(marker.meta.cuisine);

        if (matchesLine && matchesCuisine) {
            if (!map.hasLayer(marker)) map.addLayer(marker);
        } else {
            map.removeLayer(marker);
        }
    });
}

// Load restaurant review markers with metadata
fetch('data/restaurants.json')
    .then(res => res.json())
    .then(data => {
        data.forEach(place => {
            const marker = L.marker([place.lat, place.lng])
                .bindPopup(`<strong>${place.name}</strong><br>${place.review}`)
                .addTo(map);

            // Attach metadata for filtering
            marker.meta = {
                cuisine: place.cuisine, // e.g., "Thai"
                line: place.line // e.g., "Red"
            };

            allMarkers.push(marker);
        });
    });

// Connect filter checkboxes
document.querySelectorAll('#filters input').forEach(input => {
    input.addEventListener('change', filterMarkers);
});