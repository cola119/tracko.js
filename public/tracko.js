

// initData: [{key:Ueno, Lat:xxx, Long:xxx}] ユーザーの初期位置
function GPSSensor(initData) {
	var _div = null;
	var _data = initData;
	var _dataforpath = []	// Lat Longで保存
	var dataforpath = []	// pixelに変換したものを保存
	var _projection = null;

	var marker = null
	var circle = null
	var name = null
	var svg_padding = 4000;
	var padding = 10;
	var line = d3.line()
				.x(function(d){return (1)*(d.x) + svg_padding;})
				.y(function(d){return (1)*d.y + svg_padding;})
	var path = null
	var default_path_length = 30
	var path_shift_flag = true

	var centerCount = 0;

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	this.setUserCenter = function(userkey, index) {
		if(currentData[userkey] != null) {
			var d = currentData[userkey][currentData[userkey].length-1]
			d = new google.maps.LatLng(d.Lat, d.Long)
			map.setCenter(d)
		}
	}
	this.drawUserRoute = function(userkey, index) {
		if(currentData[userkey] != null) {
			console.log(index);
			var length = _dataforpath[index-1].length
			// path<15 -> 軌跡まだない -> pathを増やす
			if(length <= default_path_length) {
				path_shift_flag = false
				dataforpath[index-1] = []
				_dataforpath[index-1] = currentData[userkey].slice()
			} else {
				path_shift_flag = true
				dataforpath[index-1] = []
				_dataforpath[index-1] = currentData[userkey].slice(length-default_path_length, length)
			}
		}
		_div.selectAll("path")
			.data(_data, function(d){ return d.Key })
			.each(transformPath)
	}

	function transform(d, i) {
		// console.log("trans");
		centerCount++;
		d = new google.maps.LatLng(d.Lat, d.Long);
		if(centerCount % 10 == 0) {
			// map.setCenter(d)
		}
		d = _projection.fromLatLngToDivPixel(d); //div内の位置
		d3.select(this).style("left", (d.x - padding-100) + "px").style("top", (d.y - padding-100) + "px");
	}

	function transformCircle(d, i) {
		d = new google.maps.LatLng(d.Lat, d.Long);
		d = _projection.fromLatLngToDivPixel(d);
		d3.select(this)
			.attr("cx", d.x+svg_padding)
			.attr("cy", d.y+svg_padding)
			.attr("r", map.zoom/2)
			.attr("stroke", "black")
			.attr("stroke-width", "1.5px")
	}
	function transformName(d, i) {
		d = new google.maps.LatLng(d.Lat, d.Long);
		d = _projection.fromLatLngToDivPixel(d);
		d3.select(this)
			.attr("x", d.x+svg_padding+15)
			.attr("y", d.y+svg_padding)
			.attr("font-size", 45-map.zoom+"px")
	}
	function transformPath(d, i) {
		// dataforpath[i] = [];
		_dataforpath[i].forEach(function(_d, j) {
			d = new google.maps.LatLng(_d.Lat, _d.Long);
			d = _projection.fromLatLngToDivPixel(d);
			dataforpath[i][j] = d
		})
		// var a = dataforpath[i].slice()
		// console.log(a);
		// console.log(dataforpath[i]);
		// console.log(map.zoom);
		d3.select(this)
			.attr("d", line(dataforpath[i]))
			.attr("stroke-width", (map.zoom-11)+"px")
	}

	this.onAdd = function() {
		console.log("onAdd");
		_projection = this.getProjection();
		// 人数分初期化
		_data.forEach(function(d, i) {
			_dataforpath[i] = []
			dataforpath[i] = []
		})
		// しっぽ設定
		_data.forEach(function(d, i) {
			var userkey = "user"+(i+1)

			if(currentData[userkey] != null) {
				var length = currentData[userkey].length
				// currentDataの後ろdefault_path_length個を代入
				if(length > default_path_length) {
					// 後ろから２つ目の要素がupdateでpushするデータと連動する
					currentData[userkey].pop()
					_dataforpath[i] = currentData[userkey].slice(length-default_path_length, length)
					// var a = currentData[userkey].slice(length-default_path_length, length-1)
					// console.log(_dataforpath[i]);
					// console.log(a);
					// _dataforpath[i].pop()
				} else {
					currentData[userkey].pop()
					_dataforpath[i] = currentData[userkey].slice()
					// _dataforpath[i].pop()
				}
			}
		})
		_div = d3.select(this.getPanes().mapPane)
				.append("div")
				.attr("class", "SvgOverlay")
		d3.select(_div.node().parentNode).style("z-index", 102)
		svg = _div.append("svg")
		circle = svg.append("g")
				.selectAll("circle")
				.data(_data, function(d){ return d.Key })
				.enter()
				.append("circle")
				.attr("r", 5)
				.attr('fill', function(d, i) {
					return color(i)
				})
				.each(transformCircle)
		name = svg.append("g")
				.selectAll("text")
				.data(_data, function(d){ return d.Key })
				.enter()
				.append("text")
				.attr('fill', function(d, i) {
					return color(i)
				})
				.text(function (d) { return d.Key; })
				.each(transformName)
		path = svg.append("g")
				.selectAll("path")
				.data(_data, function(d){ return d.Key })
				.enter()
				.append("path")
				.attr("stroke", function(d, i) {
					return color(i)
				})
				.attr("stroke-width", "6px")
				.attr("fill", "none")
				.attr("opacity", 0.8)
				.each(transformPath)
	};

	this.draw = function () {
		// console.log("draw");
		_div.selectAll("circle")
			.data(_data, function(d) { return d.Key; })
			.each(transformCircle)
		_div.selectAll("text")
			.data(_data, function(d) { return d.Key; })
			.each(transformName)
		_div.selectAll("path")
			.data(_data, function(d) { return d.Key; })
			.each(transformPath)
	};

	this.onRemove = function () {
		_div.remove();
	};
	// {Key: ueno, connect: true}
	this.connection_changed = function(data) {
		_div.selectAll("circle")
			.filter(function(d) {
				return d.Key == data.Key
			})
			.attr("opacity", function(d) {
				if(data.connect) return 1;
				else return 0.3;
			})
		_div.selectAll("path")
			.filter(function(d) {
				return d.Key == data.Key
			})
			.attr("opacity", function(d) {
				if(data.connect) return 0.8;
				else return 0.3;
			})
	}

	this.update = function(data) {
		// console.log("update");
		// onAddが呼ばれて初期化される前にupdateが呼ばれることがある
		if(_dataforpath[0] == null) {
			console.log("error");
			return
		}
		_data.forEach(function(d, i) {
			if(d.Key === data.Key) {
				d.Lat = data.Lat
				d.Long = data.Long
				_dataforpath[i].push(data)	// useri
				if(_dataforpath[i].length > default_path_length && path_shift_flag == true) {
					_dataforpath[i].shift()
				}
			}
		})
		_div.selectAll("circle")
			.data(_data, function(d){ return d.Key; })
			.each(transformCircle)
		_div.selectAll("text")
			.data(_data, function(d){ return d.Key; })
			.each(transformName)
		_div.selectAll("path")
			.data(_data, function(d){ return d.Key })
			.each(transformPath)
	}
}

var sliderDiv = d3.select(".slider")
				  .append("svg")
				  .attr("width", 800)
				  .attr("height", 40)

var slider = new Slider()

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


$(document).on('click touchend', '.user-center', function() {
	var select_user = $(this).attr("id");
	var index = parseInt(select_user.split("user")[1])
	sensorLayer.setUserCenter(select_user, index)
})
$(document).on('click touchend', '.user-route', function() {
	var select_user = $(this).attr("id");
	var index = parseInt(select_user.split("user")[1])
	sensorLayer.drawUserRoute(select_user, index)
})


// firebase
var db = firebase.database();
var usernameref = db.ref("users")
var userLocation = db.ref("user-locations")

// username[user1] = "{name:ueno, connect:true}"
var username = []

// ユーザーの既存座標
var currentData = []

// svg layer
var sensorLayer = null
GPSSensor.prototype = new google.maps.OverlayView();

// map
var map = null

usernameref.once('value').then(function(snapshot) {
	var data = snapshot.val()
	for(key in data) {
		username[key] = data[key].name
		var html = '<div class="user-menu"><div class="user-name">'+username[key]+'</div><div class="user-content"><span class="user-center" id="'+key+'">center</span><br><span class="user-route" id="'+key+'">route</span></div></div>'
		$('.drawer-nav').append(html)
	}
})

usernameref.on("child_changed", function(snapshot) {
	var data = snapshot.val().connections
	var user = snapshot.ref.key
	var pushData = null
	if(data === undefined) {
		pushData = {
			Key: username[user],
			connect: false
		}
	} else {
		pushData = {
			Key: username[user],
			connect: true
		}
	}
	sensorLayer.connection_changed(pushData)
})

userLocation.once('value').then(function(snapshot) {
	console.log(".once('value')");
	// currentDataに既存座標を登録
	var data = snapshot.val();
	var cnt = 0;
	var pushData = []
	var _pushData = null
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

	// user_last_coordinateにユーザーの最終座標を登録
	var user_last_coordinate = []
	var users = Object.keys(currentData)
	for(var i = 0; i < users.length; i++) {
		user_last_coordinate[i] = currentData[users[i]][currentData[users[i]].length-1]
	}

	// google map初期化
	map = new google.maps.Map(d3.select("#map").node(), {
		zoom: 16,
		center: new google.maps.LatLng(user_last_coordinate[0].Lat, user_last_coordinate[0].Long),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		streetViewControl: false,
		mapTypeControl: false,
		disableDefaultUI: true,
	});
	var groundOverlay = new google.maps.GroundOverlay(
		// "img/ooo.png",
		// new google.maps.LatLngBounds(
		// 	new google.maps.LatLng( 35.600436 , 139.678141 ),
		// 	new google.maps.LatLng( 35.609257 , 139.685190 )
		// ),
		"img/torioi.bmp",
		new google.maps.LatLngBounds(
			new google.maps.LatLng( 35.244592 , 138.698838 ),	// 左下
			new google.maps.LatLng( 35.264056 , 138.722321 )	// 右上
		),
		{
			map: map,
			opacity: 1
		}
	)
	sensorLayer = new GPSSensor(user_last_coordinate);
	sensorLayer.setMap(map);
})

// userの座標が更新されたらupdate()
userLocation.on("child_changed", function(snapshot) {
	// console.log("child_changed");
	var data = snapshot.val();
	var keys = Object.keys(data)
	var user = snapshot.ref.key
	var newData = {
		Key: username[user],
		Lat: data[keys[keys.length-1]].lat,
		Long: data[keys[keys.length-1]].long
	}
	currentData[user].push(newData)
	// console.log(currentData);
	if(newData != null) {
		sensorLayer.update(newData)
	}
});


document.getElementById("deleteButton").onclick = function(){
	userLocation.remove();
};
