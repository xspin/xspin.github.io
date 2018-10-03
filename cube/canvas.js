function g(e) {return document.getElementById(e);}

var tx = 1, ty=1, tz=1, tw=1;
var canvas = document.getElementById("myCanvas");
var cxt=canvas.getContext("2d");


var D, T;
function update(){
    var sel = g("dim");
    D = sel.options[sel.selectedIndex].value;
    D = parseInt(D);
    T = new Array(D)
    for(var i=0; i<D; i++) T[i] = 1;
    //g("title").innerHTML = D + " Dimensional Hypercube";
    draw();
}

g("myCanvas").onmousedown = function(e) {
    var x0 = e.clientX,
        y0 = e.clientY;
    document.onmousemove = function(e) {
        var a = (x0 - (x0 = e.clientX)) / 100,
            b = (y0 - (y0 = e.clientY)) / 100;
        for(var i=0; i<D/2; ++i) {
            T[i] -= a;
            T[i+Math.floor(D/2)] -= b;
        }
        draw();
    }
    document.onmouseup = function(e) {
        document.onmousemove = null;
    }
};
//document.addEventListener('touchstart', touchstart, false);
document.ontouchstart = function(e) {
    var x0 = e.touches[0].pageX,
        y0 = e.touches[0].pageY;
    //alert('touch '+x0);
    g("title").innerHTML = " touch: "+x0;
    document.ontouchmove = function(e) {
        var a = (x0 - (x0 = e.touches[0].pageX)) / 100,
            b = (y0 - (y0 = e.touches[0].pageY)) / 100;
        for(var i=0; i<D/2; ++i) {
            T[i] -= a;
            T[i+Math.floor(D/2)] -= b;
        }
        draw();
        g("title").innerHTML = " touch: "+x0;
    }
    document.ontouchend = function(e) {
        document.ontouchmove = null;
    }
};

function drawCubeN(cxt, pt){
    cxt.beginPath();
    var x0 = canvas.width/2, y0 = canvas.height/2;
    var n = pt.length;
    for(var i=0; i<pt[0].length; ++i) {
        for(var d=0; d<n; d++) {
            var j = i|(2**d);
            //console.log(i, j);
            if(j > i) {
                var x1 = x0+pt[0][i], y1 = y0+pt[1][i];
                var x2 = x0+pt[0][j], y2 = y0+pt[1][j];
                cxt.moveTo(x1, y1);
                cxt.lineTo(x2, y2);
            }
        }
    }
    //cxt.strokeStyle = "gray";
    cxt.stroke();

}

function cubeN(n, r){
    var pt = new Array(n);
    for(var i=0; i<n; ++i) {
        pt[i] = new Array(2**n);
    }
    for(var j=0; j<2**n; ++j) {
        var bts = j.toString(2);
        bts = new Array(n-bts.length+1).join("0") + bts;
        //console.log(bts);
        for(var i=0; i<n; ++i) {
            pt[i][j] = r * (bts.charAt(i)=='0'? -1:1);
        }
    }
    //console.table(pt);
    return pt;
}

function draw() {
    cxt.clearRect(0, 0, canvas.width, canvas.height);
    var pt = cubeN(D, 100);
    pt = matMultiply(RotateN(T), pt);
    drawCubeN(cxt, pt);
}

function matMultiply(a, b) {
  var aNumRows = a.length, aNumCols = a[0].length,
      bNumRows = b.length, bNumCols = b[0].length,
      m = new Array(aNumRows);  // initialize array of rows
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}

function copy(a) {
    var b = new Array(a.length);
    for (var i=0; i<a.length; ++i) {
        b[i] = a[i].slice();
    }
    return b;
}
// N dimensional rotate
function RotateN(t) {
    var n = t.length;
    var E = new Array(n);
    for (var i=0; i<n; ++i) {
        E[i] = new Array(n);
        for (var j=0; j<n; ++j) {
            E[i][j] = 0;
        }
        E[i][i] = 1;
    }
    var R = copy(E);
    //console.table(R);
    for(var d=0; d<n; d++) {
        var Rt = copy(E);
        var a = (d+1)%n, b = (d+2)%n;
        Rt[a][a] = Rt[b][b] = Math.cos(t[d]);
        Rt[a][b] = -Math.sin(t[d]);
        Rt[b][a] = Math.sin(t[d]);
    //console.table(E);

        R = matMultiply(Rt, R);
    }
    return R;
}
