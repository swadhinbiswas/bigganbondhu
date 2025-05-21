// Type definitions for p5.js
// This is a simplified version focused on the methods we need

declare module "p5" {
  // Export both the default export (the constructor) and the P5 class
  export default class P5 {
    constructor(sketch: (p: P5) => void, node?: HTMLElement | null);

    // Canvas setup and drawing
    createCanvas(w: number, h: number): void;
    remove(): void;

    // Drawing methods
    background(color: string | number): void;
    fill(color: string | number | P5.Color): void;
    noFill(): void;
    stroke(color: string | number | P5.Color): void;
    noStroke(): void;
    strokeWeight(weight: number): void;
    rect(x: number, y: number, w: number, h: number, radius?: number): void;
    ellipse(x: number, y: number, w: number, h?: number): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    point(x: number, y: number): void;
    push(): void;
    pop(): void;
    translate(x: number, y: number): void;
    rotate(angle: number): void;
    beginShape(): void;
    endShape(close?: number): void;
    vertex(x: number, y: number): void;
    textAlign(horizontal: number, vertical?: number): void;
    textSize(size: number): void;
    text(str: string, x: number, y: number): void;
    image(
      img: P5.Image,
      x: number,
      y: number,
      width?: number,
      height?: number
    ): void;

    // Colors
    color(value: string | number): P5.Color;
    lerpColor(c1: P5.Color, c2: P5.Color, amt: number): P5.Color;

    // Math
    dist(x1: number, y1: number, x2: number, y2: number): number;
    map(
      value: number,
      start1: number,
      stop1: number,
      start2: number,
      stop2: number
    ): number;
    constrain(n: number, low: number, high: number): number;
    abs(n: number): number;
    sin(angle: number): number;
    cos(angle: number): number;
    PI: number;

    // Mouse
    mouseX: number;
    mouseY: number;
    mousePressed(): void;
    mouseReleased(): void;
    mouseMoved(): void;
    mouseDragged(): void;

    // Keyboard
    keyPressed(): void;
    keyReleased(): void;

    // Assets
    loadImage(
      path: string,
      success?: (img: P5.Image) => void,
      fail?: () => void
    ): P5.Image;

    // Other constants
    CENTER: number;
    CLOSE: number;
    DEGREES: number;
    RADIANS: number;
    HAND: number;
    ARROW: number;

    // Setup and draw (functions that are set by the sketch)
    setup: () => void;
    draw: () => void;
  }

  namespace P5 {
    class Color {
      toString(): string;
      levels: number[];
    }

    class Image {
      width: number;
      height: number;
    }
  }

  // Export types for p5.js
  export type Image = P5.Image;
  export type Color = P5.Color;
}
