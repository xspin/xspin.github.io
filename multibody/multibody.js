
const M = 1000000;
const G = 100;
const DT = 0.05;
var MIN_MASS = 4;
var MAX_MASS = 1000;
var MIN_SPEED = 1;
var MAX_SPEED = 20;
var kBody;

function g(e) {return document.getElementById(e);}

var tx = 1, ty=1, tz=1, tw=1;
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.canvas.width  = window.outerWidth;
ctx.canvas.height = window.outerHeight;

function resize() {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

function randomRgbColor() { //随机生成RGB颜色
    var r = Math.floor(Math.random() * 256); //随机生成256以内r值
    var g = Math.floor(Math.random() * 256); //随机生成256以内g值
    var b = Math.floor(Math.random() * 256); //随机生成256以内b值
    return `rgba(${r},${g},${b},0.1)`; //返回rgb(r,g,b)格式颜色
}

function drawBody(body) {
    var x = body.x;
    var y = body.y;
    var r = Math.log(body.m);
    var color = body.c;
    ctx.beginPath();
    ctx.arc(x,y, r,0,2*Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x,y, r/5,0,2*Math.PI);
    ctx.strokeStyle = 'gray';
    ctx.fill();
    ctx.stroke();
}

function draw() {
    for(var i=0; i<kBody.length; i++) {
        drawBody(kBody[i]);
    }
}

function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // resize();
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = centerX/2;

    var sel = g("dim");
    var n = sel.options[sel.selectedIndex].value;
    n = parseInt(n);
    kBody = [];
    for(var i=0; i<n; i++) {
        var r = radius * Math.random();
        var t = 2*Math.PI * Math.random();
        var x = centerX + r*Math.cos(t);
        var y = centerY + r*Math.sin(t);
        var m = MIN_MASS + (MAX_MASS-MIN_MASS)*Math.random();
        var speed = MIN_SPEED + (MAX_SPEED-MIN_SPEED)*Math.random();
        var theta = 2*Math.PI * Math.random();
        var v = [speed*Math.cos(theta), speed*Math.sin(theta)];
        var c = randomRgbColor();
        kBody.push({x:x, y:y, m:m, v:v, c:c});
    }
    draw();
}


function nextMove(k=0) {
    if(k>=kBody.length) return;
    var dv = [0, 0];
    var r1 = Math.log(kBody[k].m);
    for(var i=0; i<kBody.length; i++) {
        if(i==k) continue;
        var dx, dy;
        dx = kBody[i].x - kBody[k].x;
        dy = kBody[i].y - kBody[k].y;
        var r2 = Math.log(kBody[i].m);
        var r = Math.sqrt(dx*dx+dy*dy);
        r = Math.max(r,r1+r2);
        var t = G*kBody[i].m / (r**3);
        dv[0] += t*dx*DT;
        dv[1] += t*dy*DT;
    }
    nextMove(k+1);
    var tx = kBody[k].x + kBody[k].v[0]*DT;
    var ty = kBody[k].y + kBody[k].v[1]*DT;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var margin = Math.min(width,height) / 20;
    if(tx<=margin||ty<=margin||tx>=width-margin||ty>=height-margin) {
        var centerX = width / 2;
        var centerY = height / 2;
        var dx = centerX - kBody[k].x;
        var dy = centerY - kBody[k].y;
        var r = Math.sqrt(dx*dx+dy*dy);
        var t = G*M/(r**3);
        dv[0] += t*dx*DT;
        dv[1] += t*dy*DT;
        // ctx.strokeStyle = "#c3c3c3";
        // ctx.strokeRect(margin,margin,width-2*margin,height-2*margin);
    }
    kBody[k].x = tx;
    kBody[k].y = ty;
    kBody[k].v[0] += dv[0];
    kBody[k].v[1] += dv[1];
}

function animate() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // resize();
    nextMove();
    draw();
    requestAnimationFrame(animate);
}


init();
animate();