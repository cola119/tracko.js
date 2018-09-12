function GPSSensor(initData) {
	var _div = null;
	var _data = initData;
	var _projection = null;

	var marker = null
	var circle = null
	var text = null
	var padding = 10;

	function transform(d) {
		d = new google.maps.LatLng(d.Lat, d.Long);
		d = _projection.fromLatLngToDivPixel(d); //ドラッグしたときの変化量
		d3.select(this).style("left", (d.x - padding) + "px").style("top", (d.y - padding) + "px");
	}

	function transformWithEase(d) {
		d = new google.maps.LatLng(d.Lat, d.Long);
		d = _projection.fromLatLngToDivPixel(d);
		d3.select(this)
			.transition().duration(500)
			.attr('transform', 'translate('+(d.x - padding)+', '+(d.y - padding)+')')
	}

	// 最初に全員分のsvgを用意する
	this.onAdd = function() {
		console.log("onAdd");
		_div = d3.select(this.getPanes().overlayLayer)
				.append("div")
				.attr("class", "SvgOverlay");
		marker = _div.selectAll("svg")
				.data(_data, function (d) { return d.Key; })
				.each(transform)
				.enter().append("svg:svg")
				.attr("class", "marker");
		circle = marker.append("svg:circle")
				.attr("r", 4.5)
				.attr("cx", padding)
				.attr("cy", padding);
		text = marker.append("svg:text")
				.attr("x", padding + 7)
				.attr("y", padding)
				.attr("dy", ".31em")
				.text(function (d) { return d.Key; });
	};

	this.draw = function () {
		console.log("draw");
		_projection = this.getProjection();
		_div.selectAll("svg")
			.data(_data, function (d) { return d.Key; }) //すでに存在するものをkeyで選ぶ
			.each(transform) // update existing markers
	};

	this.onRemove = function () {
		_div.remove();
	};

	this.update = function (data) {
		console.log("update");
		for (var i = 0; i < data.length; i++) {
			var found = false;
			for (var j = 0; j < _data.length; j++) {
				if (_data[j].Key === data[i].Key) {
					found = true;
					_data[j].Lat = data[i].Lat;
					_data[j].Long = data[i].Long;
				}
			}
		}
		_div.selectAll("svg")
			.data(_data, function (d) { return d.Key; })
			.each(transform);
	};
}

var sliderDiv = d3.select(".slider")
				  .append("svg")
				  .attr("width", 800)
				  .attr("height", 40)

var slider = new Slider()
var data = []

GPSSensor.prototype = new google.maps.OverlayView();

// d3.xml("hokudai.gpx").then(function(xml) {
//     var trkpt = xml.querySelectorAll("trkseg")[0].querySelectorAll("trkpt");
//     var lat = null
//     var lon = null
//     var _data = null
//     for(var i = 0; i < trkpt.length; i++) {
//         lat = trkpt[i].attributes[0].value
//         lon = trkpt[i].attributes[1].value
//         _data = {
//           Key: "user",
//           Lat: parseFloat(lat),
//           Long: parseFloat(lon)
//         }
//         data.push(_data)
//     }
//
//     var map = new google.maps.Map(d3.select("#map").node(), {
//       zoom: 15,
//       center: new google.maps.LatLng(data[0].Lat, data[0].Long),
//       // center: new google.maps.LatLng(36.53, 139.06),
//       // center: new google.maps.LatLng(-33.690126, 150.924187),
//       mapTypeId: google.maps.MapTypeId.ROADMAP
//     });
//
//     var sensorData = [
//       // sensor1Data[0]
//       data[0]
//     ];
//     console.log(data[0])
//     var sensorLayer = new GPSSensor(sensorData);
//     sensorLayer.setMap(map);
//
//     slider.width(500).x(40).y(10).value(0).event(function() {
//         var index = Math.max(0, Math.floor(slider.value()*data.length) - 1)
//         if(index >= data.length) index = data.length - 1
//         sensorLayer.update([data[index]])
//         // console.log(data[index])
//     })
//     sliderDiv.call(slider);
// })


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


var db = firebase.database();
var userLocation = db.ref("locations")

var currentData = []
var currentData2 = []
var sensorLayer = null

var dataset = null
var pushData = null
var map = null

userLocation.once('value').then(function(snapshot) {
	var data = snapshot.val();
	for(key in data) {
		pushData = {
			Key: "ueno",
			Lat: data[key].lat,
			Long: data[key].long
		}
		pushData2 = {
			Key: "kouhei",
			Lat: data[key].lat,
			Long: data[key].long
		}
		currentData.push(pushData)
		// currentData2.push(pushData2)
	}
	dataset = [
		currentData[currentData.length-1],
		// currentData2[currentData.length-5],
	]

	map = new google.maps.Map(d3.select("#map").node(), {
		zoom: 18,
		center: new google.maps.LatLng(dataset[0].Lat, dataset[0].Long),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	sensorLayer = new GPSSensor(dataset);
	sensorLayer.setMap(map);
})

userLocation.on("child_added", function(snapshot) {
	pushData = {
		Key: "ueno",
		Lat: snapshot.child("lat").val(),
		Long: snapshot.child("long").val()
	}
	pushData2 = {
		Key: "kouhei",
		Lat: snapshot.child("lat").val(),
		Long: snapshot.child("long").val()
	}
	if(pushData != null && currentData.length > 0) {
		currentData.push(pushData)
		sensorLayer.update([pushData])
		// sensorLayer.update([pushData, pushData2])
	}
});

document.getElementById("deleteButton").onclick = function(){
	userLocation.remove();
};
