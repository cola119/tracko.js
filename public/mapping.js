var data = [];
var svg = d3.select("svg");
var width = +svg.attr("width");
var height = +svg.attr("height");

var g = svg.append("g");

d3.json("json.php").then(function(dataSet) {
    var lon_0 = Number(dataSet[0].longitude);
    var lat_0 = Number(dataSet[0].latitude);
    data.push([400, 200]);
    for(var i = 1; i < dataSet.length; i++) {
        data.push([ (Number(dataSet[i].longitude)-lon_0)*100000, (-1)*(Number(dataSet[i].latitude)-lat_0)*100000 ]); 
    }
    var circle = g.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("r", 2)
        .attr("opacity", 0.2)
        .attr("transform", function(d) {
          return "translate(" + d + ")"; 
        })
    
    dataSet.forEach(function(d, i) {
        var x = (Number(d.longitude)-lon_0)*100000;
        var y = (-1)*(Number(d.latitude)-lat_0)*100000;
        console.log(x);
        console.log(y);
        g.select("circle")
        .attr("opacity", 1)
        .attr("fill", "red")
        .attr("r", 5)
        .transition()
        .duration(100)
        .delay(100*i)
        .attr("transform", "translate(" + x + "," + y + ")")
    })
})

svg.append("rect")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .attr("width", width)
    .attr("height", height)
    .call(
      d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoom)
    );

function zoom() {
    g.attr("transform", d3.event.transform);
}