const a = 6378137;
const F = 298.257222101;
const m_0 = 0.9999;
const n = 1 / (2 * F - 1);
const p = 180 / Math.PI;


calcCartesian([36.103774791666666, 140.08785504166664], [36.0000, 139.83333333]);
function calcCartesian(coordinate, origin) {
	coordinate[0] = coordinate[0] * Math.PI/180
	coordinate[1] = coordinate[1] * Math.PI/180
	origin[0] = origin[0] * Math.PI/180
	origin[1] = origin[1] * Math.PI/180
	var A = []
	var a = []
	a[0] = 6378137

	A[0] = 1 + n*n/4 + Math.pow(n, 4)/64;
	A[1] = -1 * 3 / 2 * (n - Math.pow(n, 3)/8 - Math.pow(n, 5)/64);
	A[2] = 15 / 16 * (n*n - Math.pow(n, 4)/4);
	A[3] = -1 * 35 / 48 * (Math.pow(n, 3) - 5/16*Math.pow(n, 5));
	A[4] = 315 / 512 * Math.pow(n, 4);
	A[5] = -1 * 693 / 1280 * Math.pow(n, 5);
	let A_bar = m_0 * a[0] * A[0] / (1+n);

	a[1] = 1/2*n - 2/3*n*n + 5/16*Math.pow(n, 3) + 41/180*Math.pow(n, 4) - 127/288*Math.pow(n, 5);
	a[2] = 13/48*n*n - 3/5*Math.pow(n, 3) + 557/1440*Math.pow(n, 4) + 281/630*Math.pow(n, 5);
	a[3] = 61/240*Math.pow(n, 3) - 103/140*Math.pow(n, 4) + 15061/26880*Math.pow(n, 5);
	a[4] = 49561/161280*Math.pow(n, 4) - 179/168*Math.pow(n, 5);
	a[5] = 34729/80640*Math.pow(n, 5);

	var S_bar = A[0] * origin[0]

	for(var i = 1; i < 6; i++) {
		S_bar += A[i] * Math.sin(2*i*origin[0])
	}
	S_bar *= m_0 * a[0] / (1+n)

	let t = Math.sinh( Math.atanh(Math.sin(coordinate[0])) - 2*Math.sqrt(n)/(1+n)*Math.atanh(Math.sin(coordinate[0])*2*Math.sqrt(n)/(1+n)) )

	let t_bar = Math.sqrt(1+t*t)

	let r_c = Math.cos(coordinate[1]-origin[1])
	let r_s = Math.sin(coordinate[1]-origin[1])
	let b_dash = Math.atan(t/r_c)
	let n_dash = Math.atanh(r_s/t_bar)

	var x = b_dash
	var y = n_dash
	for(var i = 1; i < 6; i++) {
		x += a[i] * Math.sin(2*i*b_dash) * Math.cosh(2*i*n_dash)
		y += a[i] * Math.cos(2*i*b_dash) * Math.sinh(2*i*n_dash)
	}
	x = A_bar * x - S_bar
	y *= A_bar

	return [x, y]
}