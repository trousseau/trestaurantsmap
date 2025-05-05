 // Initialize the map centered on Boston
 const map = L.map('map').setView([42.3601, -71.0589], 13);

 // Add OpenStreetMap base layer
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
     attribution: '&copy; OpenStreetMap contributors'
 }).addTo(map);

 // Function to add a line with color
 function addMBTALine(geojsonUrl, color) {
     fetch(geojsonUrl)
         .then(res => res.json())
         .then(data => {
             L.geoJSON(data, {
                 style: {
                     color: color,
                     weight: 5,
                     opacity: 0.8
                 }
             }).addTo(map);
         });
 }

 // Add MBTA subway lines with their respective colors
 addMBTALine('mbta/red_line.geojson', '#DA291C'); // Red line
 addMBTALine('mbta/mattapan_trolley.geojson', '#DA291C'); // Mattapan Trolley
 addMBTALine('mbta/orange_line.geojson', '#ED8B00'); // Orange line
 addMBTALine('mbta/green_line.geojson', '#00843D'); // Green line
 addMBTALine('mbta/blue_line.geojson', '#003DA5'); // Blue line
 addMBTALine('mbta/silver_line.geojson', '#A5A5A5'); // Silver line

 // Load MBTA stations from GeoJSON
 fetch('data/mbta-stations.geojson')
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