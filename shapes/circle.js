import { context, gravity, shapes, SquareCircleColliding, TriangleCircleColliding } from '../script.js';
import Square from './square.js';
import Triangle from './triangle.js';

export default class Circle {
    // constructor with random position and set velocity
    constructor(radius, lineWidth, color, shiba, src) {
        this.x = Math.random() * innerWidth;
        this.y = innerHeight;
        this.vx = 0;
        this.vy = -20;
        this.radius = radius;
        this.lineWidth = lineWidth;
        this.color = color;
        this.shiba = shiba;
        this.src = src;
    }

    static isACircle(object) {
        return object instanceof Circle;
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

    // draws a circle to the canvas
    draw() {
        // creates image
        const img = new Image();
        img.onload = () => {
            const imageSize = this.radius * 2;
            context.drawImage(img, this.x - this.radius, this.y - this.radius, imageSize, imageSize);
        }
        img.src = this.src;

        // draws the circle
        context.beginPath();
        context.lineWidth = this.lineWidth;
        context.strokeStyle = this.color;
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

        // clips image to a circular shape
        if (this.isShibaNeeded()) {
            context.save();
            context.clip();
            img.onload();
            context.restore();
        }
        context.stroke();
    }

    // updates the circle's position
    update() {
        this.draw();

        this.x += this.vx; // add velocity x to x position
        this.y += this.vy; // add velocity y to y position
        this.vy += gravity; // add gravity to velocity y

        // if you reach top of screen, stop movement
        if (this.y < this.radius) {
            this.y = this.radius;
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

                // if shape is a circle
                if (Circle.isACircle(shapes[i])) {
                    const distanceBetweenCircles = Circle.getDistance(this.x, this.y, shapes[i].x, shapes[i].y);
                    const totalRadii = this.radius + shapes[i].radius;
                    // if circles touch
                    if (distanceBetweenCircles <= totalRadii) {
                        shapes[i].vy = 0;
                    }
                }

                // if shape is a square
                if(Square.isASquare(shapes[i])) {
                  if(SquareCircleColliding(this, shapes[i]) === true) {
                    shapes[i].vy = 0;
                  }
                }

                // if shape is a triangle
                if(Triangle.isATriangle(shapes[i])) {
                  if(TriangleCircleColliding(this, shapes[i]) === true) {
                    shapes[i].vy = 0;
                  }
                }
            }
        }
    }
}
