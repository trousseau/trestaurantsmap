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
        const layer = L.geoJSON(data, {
          style: {
            color: color,
            weight: 5,
            opacity: 0.8
          }
        }).addTo(map);
        map.fitBounds(layer.getBounds());
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
        const lines = Array.isArray(feature.properties.lines)
          ? feature.properties.lines.join(", ")
          : "Unknown lines";

        layer.bindPopup(`<strong>${name}</strong><br>Lines: ${lines}`);
      }
    }).addTo(map);
  });

  fetch('mbta/green_line.geojson')
  .then(res => res.json())
  .then(data => {
    console.log(data); // See if it includes the extension
    L.geoJSON(data, {
      style: {
        color: '#00843D',
        weight: 5,
        opacity: 0.8
      }
    }).addTo(map);
  });


// Load restaurant review markers
fetch('data/restaurants.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(place => {
      L.marker([place.lat, place.lng])
        .addTo(map)
        .bindPopup(`<strong>${place.name}</strong><br>${place.review}`);
    });
  });
