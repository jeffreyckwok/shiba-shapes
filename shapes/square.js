import { context, gravity, shapes, SquareCircleColliding, TriangleSquareColliding } from '../script.js';
import Circle from './circle.js';
import Triangle from './triangle.js';

export default class Square {
    // constructor with random position and set velocity
    constructor(size, lineWidth, color, shiba, src) {
        this.x = Math.random() * innerWidth;
        this.y = innerHeight;
        this.vx = 0;
        this.vy = -20;
        this.size = size;
        this.lineWidth = lineWidth;
        this.color = color;
        this.shiba = shiba;
        this.src = src;
    }

    static isASquare(object) {
        return object instanceof Square;
    }

    // helper functions to calculate square intersection
    static rangeIntersect(min1, max1, min2, max2) {
        const firstRange = Math.max(min1, max1) >= Math.min(min2, max2);
        const secondRange = Math.min(min1, max1) <= Math.max(min2, max2);
        return firstRange && secondRange;
    }

    static squareIntersect(s1, s2) {
        const xRange = Square.rangeIntersect(s1.x, s1.x + s1.size, s2.x, s2.x + s2.size);
        const yRange = Square.rangeIntersect(s1.y, s1.y + s1.size, s2.y, s2.y + s2.size);
        return xRange && yRange;
    }

    isShibaNeeded() {
        if (this.shiba === 'yes') {
            return true;
        }
        return false;
    }

    // will draw a square to the canvas
    draw() {
        // creates image
        const img = new Image();
        img.onload = () => {
            context.drawImage(img, this.x, this.y, this.size, this.size);
        }
        img.src = this.src;

        // draws the square
        context.beginPath();
        context.rect(this.x, this.y, this.size, this.size);
        context.lineWidth = this.lineWidth;
        context.strokeStyle = this.color;

        // checks if you should insert shiba into the square
        if (this.isShibaNeeded() === true) {
            img.onload();
        }
        context.stroke();
    }

    // updates the position of the square
    update() {
        this.draw();

        this.x += this.vx; // add velocity x to x position
        this.y += this.vy; // add velocity y to y position
        this.vy += gravity; // add gravity to velocity y

        // if you reach top of screen, stop movement
        if (this.y < 0) {
            this.y = 0;
            this.vy = 0;
            this.vx = 0;
        }


        // if there is more than one shape within shapes array
        if (shapes.length > 1) {
            for (let i = 0; i < shapes.length; i++) {
                // if shape equals itself, move onto next iteration of loop
                if (this === shapes[i]) {
                    continue;
                }

                // if shape is a square
                if (Square.isASquare(shapes[i])) {
                    const squaresIntersect = Square.squareIntersect(this, shapes[i]);

                    // if squares intersect
                    if (squaresIntersect) {
                        shapes[i].vy = 0;
                    }
                }

                // if shape is a circle
                if(Circle.isACircle(shapes[i])) {
                  if(SquareCircleColliding(shapes[i], this) === true) {
                    shapes[i].vy = 0;
                  }
                }

                // if shape is a triangle
                if(Triangle.isATriangle(shapes[i])) {
                  if(TriangleSquareColliding(this, shapes[i]) === true) {
                    shapes[i].vy = 0;
                  }
                }


            }
        }
    }
}
