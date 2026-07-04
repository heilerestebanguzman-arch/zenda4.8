export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  document_id: string;
  license_number: string;
  license_expiry: Date | null;
  license_type: string;
  address: string;
  status: DriverStatus;
  hire_date: Date;
  termination_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDriverInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  document_id: string;
  license_number: string;
  license_expiry?: Date;
  license_type?: string;
  address?: string;
  hire_date: Date;
}

export interface UpdateDriverInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  document_id?: string;
  license_number?: string;
  license_expiry?: Date;
  license_type?: string;
  address?: string;
  status?: DriverStatus;
  termination_date?: Date;
}
