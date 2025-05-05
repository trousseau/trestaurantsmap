const map = L.map('map').setView([42.3601, -71.0589], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load line data
fetch('data/lines.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: function (feature) {
        const color = lineColors[feature.properties.id] || "#555";
        return {
          color: color,
          weight: 6,
          opacity: 0.9
        };
      }
    }).addTo(map);
  });

// Load station data
fetch('data/stations.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        const primaryLine = feature.properties.lines[0];
        const baseColor = lineColors[primaryLine] || "#999999";
        const fill = adjustColor(baseColor, 30);

        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: fill,
          color: baseColor,
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        });
      }
    }).addTo(map);
  });
