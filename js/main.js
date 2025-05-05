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

 fetch('data/mbta-stations.geojson')
 .then(res => res.json())
 .then(data => {
   // Check if there are features in the GeoJSON
   if (!data.features || data.features.length === 0) {
     console.error("GeoJSON data is empty or malformed.");
     return;
   }

   L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       const primaryLine = feature.properties.lines ? feature.properties.lines[0] : "Unknown Line";
       const baseColor = lineColors[primaryLine] || "#999999"; // Default gray if no color found

       return L.circleMarker(latlng, {
         radius: 6,
         fillColor: baseColor,
         color: baseColor,
         weight: 2,
         opacity: 1,
         fillOpacity: 0.9
       })
       .bindPopup(`
         <strong>${feature.properties.name || "Unnamed Station"}</strong><br>
         Lines: ${feature.properties.lines ? feature.properties.lines.join(', ') : 'N/A'}
       `);
     }
   }).addTo(map);
 })
 .catch(error => {
   console.error("Error loading GeoJSON:", error);
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