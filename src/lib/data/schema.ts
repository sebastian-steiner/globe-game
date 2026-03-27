export interface Point {
  x: number;
  y: number;
}

export interface Country {
  id: number;
  code: string;
  name: string;
  p1: Point;
  p3: Point;
}

export interface Continent {
  code: string;
  name: string;
  countries: string[];
}

export interface Region {
  code: number;
  name: string;
}

export interface Subregion {
  code: number;
  name: string;
}
