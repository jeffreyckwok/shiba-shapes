import { context, gravity, shapes, TriangleCircleColliding, TriangleSquareColliding } from '../script.js';
import Circle from './circle.js';
import Square from './square.js';


export default class Triangle {
    // constructor with random position and set velocity
    constructor(sideLength, lineWidth, color, shiba, src) {
        this.x = Math.random() * innerWidth;
        this.y = innerHeight;
        this.vx = 0;
        this.vy = -20;
        this.sideLength = sideLength;
        this.lineWidth = lineWidth;
        this.color = color;
        this.shiba = shiba;
        this.src = src;
    }

    static isATriangle(object) {
        return object instanceof Triangle;
    }

    // pythagorean theorem
    static getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt((dx * dx) + (dy * dy));
    }

    isShibaNeeded() {
        if (this.shiba === 'yes') {
            return true;
        }
        return false;
    }

    // will draw a square to the canvas
    draw() {
        let height = this.sideLength * (Math.sqrt(3) / 2);

        // saving image
        const img = new Image();
        img.onload = () => {
            const x = this.x - (height / 2);
            const y = this.y - (height / 2);
            context.drawImage(img, x - 6, y, height + 12, height);
        }
        img.src = this.src;

        // draws equilateral triangle
        context.save();
        context.beginPath();
        context.translate(this.x, this.y);
        context.moveTo(0, -height / 2);
        context.lineTo(-this.sideLength / 2, height / 2);
        context.lineTo(this.sideLength / 2, height / 2);
        context.closePath();
        context.lineWidth = this.lineWidth;
        context.strokeStyle = this.color;
        context.rotate(0);
        context.stroke();
        context.restore();

        // checks if you should insert shiba into the triangle
        if (this.isShibaNeeded() === true) {
            context.save();
            this.lineWidth = 15; // make line width a bit thicker
            context.clip();
            img.onload();
            context.restore();
        }
    }

    // updates the position of the square
    update() {
        this.draw();

        this.x += this.vx; // add velocity x to x position
        this.y += this.vy; // add velocity y to y position
        this.vy += gravity; // add gravity to velocity y

        // if you reach top of screen, stop movement
        if (this.y < (this.sideLength / 2)) {
            this.y = (this.sideLength / 2);
            this.vy = 0;
            this.vx = 0;
        }

        // if there is more than one shape within shapes array
        if (shapes.length > 1) {
            for (let i = 0; i < shapes.length; i++) {
                // if shape equals itself, restart loop
                if (this === shapes[i]) {
                    continue;
                }

                // if shape is a triangle
                if (Triangle.isATriangle(shapes[i])) {
                    const distanceBetweenTriangles = Triangle.getDistance(this.x, this.y, shapes[i].x, shapes[i].y);
                    const height = this.sideLength * (Math.sqrt(3) / 2);

                    // if triangles touch
                    if (distanceBetweenTriangles <= height) {
                        shapes[i].vy = 0;
                    }
                }

                // if shape is a circle
                if(Circle.isACircle(shapes[i])) {
                  if(TriangleCircleColliding(shapes[i], this) === true) {
                    shapes[i].vy = 0;
                  }
                }

                // if shape is a square
                if(Square.isASquare(shapes[i])) {
                  if(TriangleSquareColliding(shapes[i], this) === true) {
                    shapes[i].vy = 0;
                  }
                }
            }
        }
    }
}
