var data = [];
var width = 800; 
var height = 600;

var svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height)

var sliderDiv = d3.select(".slider")
                .append("svg")
                .attr("width", width)
                .attr("height", 40)

var svgImage = svg.append("image")
                .attr("xlink:href", "img/akagi.jpg")
                .attr("transform", "scale(0.5) rotate(7)")

var g = svg.append("g")
        .attr("transform", "scale(0.5)")

// d3.zoomTransform(svgImage).k = 0.5;
d3.zoomTransform(g).k = 0.5;

var pointer;
var slider = new Slider()

// console.log(calcCartesian([36.103774791666666, 140.08785504166664], [36.0000, 139.83333333]));


//--------------- set data[] ---------------------
d3.xml("test.gpx").then(function(xml) {
    
    var trkpt = xml.querySelectorAll("trkseg")[0].querySelectorAll("trkpt");
    var lat0 = trkpt[0].attributes[0].value
    var lon0 = trkpt[0].attributes[1].value
    var origin = calcCartesian([lat0, lon0], [36.0000, 139.83333333])
    for(var i = 0; i < trkpt.length; i=i+5) {
        var lat = trkpt[i].attributes[0].value
        var lon = trkpt[i].attributes[1].value
        var result = calcCartesian([lat, lon], [36.0000, 139.83333333])
        // x, y
        data.push([ (result[1]-origin[1])/1.5+600, -1*(result[0]-origin[0])/1.5+800 ])
        // data.push([(lon-lon0)*52000+720, (-1)*(lat-lat0)*58000+720]);
    }
    console.log(data)
    pointer = g.append("circle")
        .attr("cx", data[0][0])
        .attr("cy", data[0][1])
        .attr("opacity", 0.6)
        .attr("fill", "blue")
        .attr("r", 10)

    var lineFunction = d3.line()
                        .x(function(d) { return d[0]; })
                        .y(function(d) { return d[1]; })
                        .curve(d3.curveCardinal)

    var lineGraph = g.append("path")
                        .attr("d", lineFunction(data))
                        .attr("stroke", "blue")
                        .attr("stroke-width", 2)
                        .attr("fill", "none");
})
//--------------- set data[] ---------------------


// event: ドラッグされたときの処理
slider.width(500).x(40).y(10).value(0).event(function() {
    var index = Math.max(0, Math.floor(slider.value()*data.length) - 1)
    if(index >= data.length) index = data.length - 1
    var x = data[index][0] - data[0][0];    // 変化量
    var y = data[index][1] - data[0][1];
    pointer.transition()
        .duration(100)
        .delay(100)
        .attr("transform", "translate(" + x + "," + y + ")")
})
sliderDiv.call(slider);


// set zoom
svg.call(
    d3.zoom()
        .scaleExtent([1 / 10, 12])
        .on("zoom", zoomed)
);

function zoomed() {
    console.log(d3.event.transform)
    g.attr("transform", d3.event.transform+", rotate(0)");
    svgImage.attr("transform", d3.event.transform+", rotate(7)")
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function Slider () {
    var width = 100
    var value = 0.5 /* Domain assumes to be [0 - 1] */
    var event
    var x = 0
    var y = 0
    var playflag = 0

    function slider (selection) {
        d3.select("#playButton").on("click", function() {
            if(playflag == 0 && value < 1) {
                playStart()
            } else {
                playStop()
            }
        })

        function playStart() {
            d3.select("#playButton").text("stop")
            playflag = 1;
            update()
        }

        function playStop() {
            d3.select("#playButton").text("start")
            playflag = 0;
        }

        // 0.1秒ごとにpointerを移動
        async function update() {
            if(playflag == 1) {
                while(value < 1 && playflag == 1) {
                    await sleep(100)
                    value += 1 / data.length;
                    newX = value * width + x
                    updateSlider(newX)
                    event()
                }
                playflag = 0
            }
        }
        //Line to represent the current value
        var valueLine = selection.append("line")
            .attr("x1", x)
            .attr("x2", x + (width * value))
            .attr("y1", y)
            .attr("y2", y)
            .style("stroke", "#51CB3F")
            .style("stroke-linecap", "round")
            .style("stroke-width", 6)

        //Line to show the remaining value
        var emptyLine = selection.append("line")
            .attr("x1", x + (width * value))
            .attr("x2", x + width)
            .attr("y1", y)
            .attr("y2", y)
            .style("stroke", "#ECECEC")
            .style("stroke-linecap", "round")
            .style("stroke-width", 6)

        // when dragged
        var drag = d3.drag().on("drag", function() {
            // set newX
            var newX = d3.mouse(this)[0];
            if (newX < x) {
                newX = x;
            } else if (newX > x + width) {
                newX = x + width;
            }
            // set value
            value = (newX - x) / width;
            // updates
            updateSlider(newX)
            event() // if(event)
            d3.event.sourceEvent.stopPropagation();
        })

        //Draggable circle to represent the current value
        var valueCircle = selection.append("circle")
            .attr("cx", x + (width * value))
            .attr("cy", y)
            .attr("r", 8)
            .style("stroke", "black")
            .style("stroke-width", 1.0)
            .style("fill", "white")
            .call(drag);

        function updateSlider(newX) {
            valueCircle.attr("cx", newX);
            valueLine.attr("x2", newX);
            emptyLine.attr("x1", newX);
        }
    }

    slider.x = function (val) {
        x = val;
        return slider;
    }

    slider.y = function (val) {
        y = val;
        return slider;
    }

    slider.value = function (val) {
        if (val != null) {
            value = val;
            return slider;
        } else {
            return value;
        }
    }

    slider.width = function (val) {
        width = val;
        return slider;
    }

    slider.event = function (val) {
        event = val;
        return slider;
    }

    return slider;
}


