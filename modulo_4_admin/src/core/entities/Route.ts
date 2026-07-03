export interface Route {
  id: string;
  name: string;
  description: string;
  stops: Stop[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  routeId: string;
  createdAt: Date;
  updatedAt: Date;
}
