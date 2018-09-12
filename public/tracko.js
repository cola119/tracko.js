// d3.xml("test.gpx").then(main)



function GPSSensor(dataset) {
  var layer = null
  var svg = null
  var pointLayer = null
  var googleMapProjection = null
  this.onAdd = function() {
    layer = d3.select(this.getPanes().overlayLayer).append("div").attr("class", "SvgOverlay");
    svg = layer.append("svg");
    const svgOverlay = svg.append("g").attr("class", "AdminDivisions");
    pointLayer = svgOverlay.append("g");
    const voronoiLayer = svgOverlay.append("g");
    const markerOverlay = this;
    const overlayProjection = markerOverlay.getProjection();

    googleMapProjection =  coordinates =>  {
      const googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
      const pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
      return [pixelCoordinates.x + 4000, pixelCoordinates.y + 4000];
    }
  }

  this.draw = function () {
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    const positions = [];

    dataset.forEach(d => {
      positions.push(googleMapProjection([d[0], d[1]]));
    });

    const updatePoint = pointLayer.selectAll(".point").data(positions)
    const enterPoint = updatePoint.enter()
      .append("circle")
      .attr("class", "point")
      .attr("r", 2);

    const point = updatePoint.merge(enterPoint)
      .attr("transform", d =>  `translate(${d[0]}, ${d[1]})` )
  }
}

GPSSensor.prototype = new google.maps.OverlayView();

var map = new google.maps.Map(document.getElementById('map'), {
  zoom: 9,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  center: new google.maps.LatLng(36.53, 139.06),
});


var dataset = [];

d3.xml("test.gpx").then(function(xml) {
  var trkpt = xml.querySelectorAll("trkseg")[0].querySelectorAll("trkpt");
  for(var i = 0; i < trkpt.length; i=i+5) {
    var lat = trkpt[i].attributes[0].value
    var lon = trkpt[i].attributes[1].value
    dataset.push([lat, lon])
  }

  var sensorLayer = new GPSSensor(dataset);
  sensorLayer.setMap(map);
})
