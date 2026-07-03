export interface Fare {
  id: string;
  routeId: string;
  amount: number;
  currency: string;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfficialFare {
  id: string;
  name: string;
  amount: number;
  currency: string;
  decreeNumber: string;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
