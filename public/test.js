// 数点を記憶してそれをなめらかに遷移させればなめらかになる？
// しっぽ
// 結局全部の座標を保存？
function GPSSensor(initData) {
	var _div = null;
	var _data = initData;
	var _dataforpath = [[]];
	var dataforpath = []
	var _projection = null;

	var marker = null
	var circle = null
	var text = null
	var line = d3.line()
				.x(function(d){return d[0];})
				.y(function(d){return d[1];})
	var path = null
	var padding = 10;

	var centerCount = 0;

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	function transform(d, i) {
		// console.log("trans");
		centerCount++;
		d = new google.maps.LatLng(d.Lat, d.Long);
		if(centerCount % 10 == 0) {
			// map.setCenter(d)
		}
		circle.attr("r", map.zoom/3)
		text.attr("font-size", 35-map.zoom+"px")
		d = _projection.fromLatLngToDivPixel(d); //ドラッグしたときの変化量

		// console.log(i);
		// _dataforpath[i][_dataforpath[i].length] = [d.x - padding-100, d.y - padding-100]
		// dataforpath[i] = _dataforpath[i].map(function(v, i, arr) {
		// 	if(i == 0) return v
		// 	else return [v[0] - arr[i-1][0], v[1] - arr[i-1][1]]
		// })
		//
		// d3.select(this).selectAll("path").attr("d", line(dataforpath[i]))
		d3.select(this).style("left", (d.x - padding-100) + "px").style("top", (d.y - padding-100) + "px");
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
		for(var i = 0; i < _data.length; i++) {
			_dataforpath[i] = []
			_dataforpath[i][0] = [padding, padding]
		}
		// console.log("onAdd");
		_div = d3.select(this.getPanes().overlayLayer)
				.append("div")
				.attr("class", "SvgOverlay");
		marker = _div.selectAll("svg")
				.data(_data, function (d) { return d.Key; })
				.each(transform)
				.enter().append("svg:svg")
				.attr("class", "marker")
		circle = marker.append("svg:circle")
				.attr("r", 4.5)
				.attr("cx", padding)
				.attr("cy", padding)
				.attr('fill', function(d, i) {
					return color(i)
				})
		text = marker.append("svg:text")
				.attr("x", padding + 10)
				.attr("y", padding)
				.attr("dy", ".31em")
				.attr('fill', function(d, i) {
					return color(i)
				})
				.text(function (d) { return d.Key; });

		// _dataforpath[0] = [padding, padding]
		// path = marker.append("svg:path")
		// 		// .attr("d", line())
		// 		.attr("stroke", "lightgreen")
		// 		.attr("stroke-width", "4px")
	};

	this.draw = function () {
		// console.log("draw");
		_projection = this.getProjection();
		_div.selectAll("svg")
			.data(_data, function (d) { return d.Key; }) //すでに存在するものをkeyで選ぶ
			.each(transform) // update existing markers
	};

	this.onRemove = function () {
		_div.remove();
	};

	this.update = function (data) {
		// console.log("update");
		for (var i = 0; i < data.length; i++) {
			for (var j = 0; j < _data.length; j++) {
				if (_data[j].Key === data[i].Key) {
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
var usernameref = db.ref("users")
var userLocation = db.ref("user-locations")

var username = []

// いる？
var currentData = []
var sensorLayer = null

var dataset = []
var pushData = []
var _pushData = null
var map = null
var cnt = 0

usernameref.once('value').then(function(snapshot) {
	var data = snapshot.val()
	for(key in data) {
		username[key] = data[key].name
	}
})

userLocation.once('value').then(function(snapshot) {
	var data = snapshot.val();
	for(user in data) {
		for(key in data[user]) {
			_pushData = {
				Key: username[user],
				Lat: data[user][key].lat,
				Long: data[user][key].long
			}
			pushData[cnt] = _pushData
			cnt++
		}
		currentData[user] = pushData
		cnt = 0
		pushData = []
	}
	var users = Object.keys(currentData)
	//
	for(var i = 0; i < users.length; i++) {
		dataset[i] = currentData[users[i]][currentData[users[i]].length-1]
	}
	map = new google.maps.Map(d3.select("#map").node(), {
		zoom: 16,
		center: new google.maps.LatLng(dataset[0].Lat, dataset[0].Long),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	var groundOverlay = new google.maps.GroundOverlay( "img/ooo.png", new google.maps.LatLngBounds(
		new google.maps.LatLng( 35.600436 , 139.678141 ),
		new google.maps.LatLng( 35.609257 , 139.685190 )
		// new google.maps.LatLng( 36.525904 , 139.091286 ),
		// new google.maps.LatLng( 36.547642 , 139.099084 )
	), {
		map: map,
		opacity: 1
	} )
	sensorLayer = new GPSSensor(dataset);
	sensorLayer.setMap(map);

	var element = document.getElementsByTagName("img")
})

userLocation.on("child_changed", function(snapshot) {
	var data = snapshot.val();
	var keys = Object.keys(data)
	var key = snapshot.ref.key
	pushData = {
		Key: username[key],
		Lat: data[keys[keys.length-1]].lat,
		Long: data[keys[keys.length-1]].long
	}
	if(pushData != null) {
		// console.log(pushData);
		sensorLayer.update([pushData])
	}
});

document.getElementById("deleteButton").onclick = function(){
	userLocation.remove();
};
