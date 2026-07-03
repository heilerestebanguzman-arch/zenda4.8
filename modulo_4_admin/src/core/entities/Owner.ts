export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentId: string;
  status: OwnerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type OwnerStatus = 'active' | 'inactive' | 'suspended';
