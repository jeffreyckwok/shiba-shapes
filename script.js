import Circle from './shapes/circle.js';
import Square from './shapes/square.js';
import Triangle from './shapes/triangle.js';

export let context, gravity, shapes;

// url for API
const BASE_URL = (number, urlBool, httpsBool) =>
    `https://shibe.online/api/shibes?count=${number}&urls=${urlBool}&httpsUrls=${httpsBool}`;

// canvas
const canvas = document.getElementById('myCanvas');
context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// for storing shapes
shapes = [];

// for storing our shiba images
let images = [];
let imageIndex = 0;

// our form
const form = document.forms[0];

// gravity for shapes
gravity = -1; // postive = down, negative = up



// fetch data from API and return as JSON
async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}


// cache images to reduce amount API requests
function cacheImagesFromAPI() {
    const promise = fetchData(BASE_URL(30, true, true)); // request 30 images
    promise.then((response) => {
        images = response.map(image => image);
    });
}



function showAlertIfOptionsAreMissing(options) {
    // if options are missing or empty, alert and return out
    if (options.color === false || options.shape === false || options.shiba === false) {
        alert("Please select all options");
        return;
    }
}
function checkIfNewImagesAreNeeded() {
    // check to see if image index matches the length of images
    if ((imageIndex + 1) === images.length) {
        // if so, get new images from API, save them, and reset imageIndex
        cacheImagesFromAPI();
        imageIndex = -1;
    }
}
function increaseImageIndexIfShibaWasChosen(shibaOption) {
    // if shiba option was chosen, update imageIndex
    if (shibaOption === 'yes') {
        imageIndex++;
    }
}
// draw custom shape with selected options from form
function createCustomShape(options) {
    // helper functions
    checkIfNewImagesAreNeeded();
    showAlertIfOptionsAreMissing(options);
    increaseImageIndexIfShibaWasChosen(options.shiba);

    // random sizes for shapes
    const randomSize = Math.floor(Math.random() * 150) + 30; // for square
    const randomSide = Math.floor(Math.random() * 200) + 30; // for triangle
    const randomRadius = Math.floor(Math.random() * 100) + 10; // for circle

    // if user chose a square, create a square and return out
    if (options.shape === 'square') {
        const square = new Square(randomSize, 10, options.color, options.shiba, images[imageIndex]);
        shapes.push(square);
        return;
    }
    // if user chose triangle, create triangle and return out
    if (options.shape === 'triangle') {
        const triangle = new Triangle(randomSide, 10, options.color, options.shiba, images[imageIndex]);
        shapes.push(triangle);
        return;
    }
    // if user chose circle, create circle
    if (options.shape === 'circle') {
        const circle = new Circle(randomRadius, 10, options.color, options.shiba, images[imageIndex]);
        shapes.push(circle);
    }
}



function getSelectedRadioOption(name) {
    const radios = [...form.elements[name]]; // converts RadioNodelist to an array
    const elementData = radios.filter(value => value.checked === true); // filter for selected option
    // if no option was checked, save as false, else save the id of the option chosen
    const selectedOption = elementData.length === 0 ? false : elementData[0].id;
    return selectedOption;
}
function changeColorStringToHexString(color) {
    if (color === 'blue') {
        return '#3575C5';
    }
    if (color === 'green') {
        return '#00AA3B';
    }
    if (color === 'orange') {
        return '#FFB92B';
    }
    return '#000000'; // default to black
}


// check for square and circle collision
export function SquareCircleColliding(circle, square) {
  var distX = Math.abs(circle.x - square.x - square.size / 2);
  var distY = Math.abs(circle.y - square.y - square.size / 2);
  if (distX > (square.size / 2 + circle.radius)) {
    return false;
  }
  if (distY > (square.size / 2 + circle.radius)) {
    return false;
  }

  if (distX <= (square.size / 2) || distY <= (square.size / 2)) {
    return true;
  }

  var dx = distX - square.size / 2;
  var dy = distY - square.size / 2;
  return (dx * dx + dy * dy <= (circle.radius * circle.radius));
}

// check for triangle and circle collision
export function TriangleCircleColliding(circle, triangle) {
  //check edges
  const rad3 = Math.sqrt(3);
  var edges = [[triangle.x-triangle.sideLength/2, triangle.y-triangle.sideLength/rad3], [triangle.x, triangle.y+triangle.sideLength/rad3], [triangle.x+triangle.sideLength/2, triangle]];
  for (var i = 0;i<edges.length-1;i++) {
    if (lineCircle(edges[i][0], edges[i][1], edges[i+1][0], edges[i+1][1], triangle.sideLength, circle.x, circle.y, circle.radius) === true) {
      return true;
    }
  }
}

// check if triangle side is inside circle
function lineCircle(x1, y1, x2, y2, l, cx, cy, r) {
  //check if either end is inside circle
  var inside1 = pointCircle(x1,y1, cx, cy, r);
  var inside2 = pointCircle(x2,y2, cx, cy, r);
  if (inside1 || inside2) return true;

  //get dot product of line and circle
  var dot = ( ((cx-x1)*(x2-x1)) + ((cy-y1)*(y2-y1)) ) / Math.pow(l,2);

  // find the closest point on the line
  var closestX = x1 + (dot * (x2-x1));
  var closestY = y1 + (dot * (y2-y1));

  //is point on line segment? if so continue, if not return false
  if(linePoint(x1,y1,x2,y2,closestX,closestY,l) === false) {
    return false;
  }
}

// line/point
function linePoint(x1, y1, x2, y2, px, py, l) {
  // get distance from the point to the two ends of the line
  var a = px-x1;
  var b = py-y1;
  var c = px-x2;
  var d = py-y2;
  var d1 = Math.sqrt(a*a + b*b);
  var d2 = Math.sqrt(c*c + d*d);

  // add a little buffer zone that will give collision
  var buffer = 0.1;    // higher # = less accurate

  // if the two distances are equal to the line's
  // length, the point is on the line!
  if (d1+d2 >= l-buffer && d1+d2 <= l+buffer) {
    return true;
  }
  return false;
}

// point/circle
function pointCircle(px, py, cx, cy, r) {

  // get distance between the point and circle's center
  // using the Pythagorean Theorem
  var distX = px - cx;
  var distY = py - cy;
  var distance = Math.sqrt( (distX*distX) + (distY*distY) );

  // if the distance is less than the circle's
  // radius the point is inside!
  if (distance <= r) {
    return true;
  }
  return false;
}

// check for triangle and square collision
export function TriangleSquareColliding(square, triangle) {
  var rad3 = Math.sqrt(3);
  var edges = [[triangle.x-triangle.sideLength/2, triangle.y-triangle.sideLength/rad3], [triangle.x, triangle.y+triangle.sideLength/rad3], [triangle.x+triangle.sideLength/2, triangle]];
  for (var i = 0;i<edges.length-1;i++) {
    if (lineSquare(edges[i][0], edges[i][1], edges[i+1][0], edges[i+1][1], square.x, square.y, square.size, square.size) === true) {
      return true;
    }
  }
}

// line/square
function lineSquare(x1, y1, x2, y2, sx, sy, width, height) {
  var left = lineLine(x1, y1, x2, y2, sx, sy, sx, sy+height);
  var right = lineLine(x1,y1,x2,y2, sx+width,sy, sx+width,sy+height);
  var top = lineLine(x1,y1,x2,y2, sx,sy, sx+width,sy);
  var bottom = lineLine(x1,y1,x2,y2, sx,sy+height, sx+width,sy+height);

  // if any of the above are true,
  // the line has hit the rectangle
  if (left || right || top || bottom) {
    return true;
  }
  return false;
}

// line/line
function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {

  // calculate the direction of the lines
  var uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  var uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return true;
  }
  return false;
}

// will create custom shape when 'Generate' button is clicked
form.addEventListener('submit', (e) => {
    // prevents default action of the button
    e.preventDefault();

    // save all options into an object
    const options = {};
    options.color = changeColorStringToHexString(getSelectedRadioOption('color'));
    options.shape = getSelectedRadioOption('shape');
    options.shiba = getSelectedRadioOption('shiba');

    // create custom shape with selected options
    createCustomShape(options);
});
// will clear the screen when 'Clear Screen' button is clicked
const clearButton = document.getElementById('clear');
clearButton.addEventListener('click', () => animation.pause());



// animating the shapes
let animation = {
    play: () => {
        // animate the shapes that are in the shapes array
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < shapes.length; i++) {
            shapes[i].update();
        }
        requestAnimationFrame(animation.play);
    },
    pause: () => window.location.reload()
};

// initialization function
function init() {
    animation.play();
    cacheImagesFromAPI();
}
window.onload = () => init();
