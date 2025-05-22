declare module "p5" {
  export default class P5 {
    constructor(sketch: (p: P5) => void, node?: HTMLElement | null);

    // Canvas methods
    createCanvas(w: number, h: number): any;
    background(r: number, g: number, b: number, a?: number): void;
    background(color: any): void;

    // Drawing methods
    line(x1: number, y1: number, x2: number, y2: number): void;
    rect(
      x: number,
      y: number,
      w: number,
      h: number,
      tl?: number,
      tr?: number,
      br?: number,
      bl?: number,
    ): void;
    ellipse(x: number, y: number, w: number, h?: number): void;
    triangle(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      x3: number,
      y3: number,
    ): void;
    arc(
      x: number,
      y: number,
      w: number,
      h: number,
      start: number,
      stop: number,
    ): void;

    // Style methods
    fill(r: number, g: number, b: number, a?: number): void;
    fill(color: any): void;
    noFill(): void;
    stroke(r: number, g: number, b: number, a?: number): void;
    stroke(color: any): void;
    noStroke(): void;
    strokeWeight(weight: number): void;

    // Color methods
    color(r: number, g: number, b: number, a?: number): any;
    color(hex: string): any;

    // Text methods
    text(str: string, x: number, y: number): void;
    textSize(size: number): void;
    textAlign(horizontalAlign: number, verticalAlign?: number): void;

    // Shape methods
    beginShape(): void;
    endShape(mode?: number): void;
    vertex(x: number, y: number): void;

    // Transform methods
    push(): void;
    pop(): void;
    translate(x: number, y: number): void;
    rotate(angle: number): void;

    // Constants
    DEGREES: number;
    CENTER: number;
    PI: number;
    ALT: number;

    // Mouse and keyboard
    mouseX: number;
    mouseY: number;
    keyIsDown(code: number): boolean;

    // Misc
    dist(x1: number, y1: number, x2: number, y2: number): number;
    angleMode(mode: number): void;
    rectMode(mode: number): void;
  }
}
