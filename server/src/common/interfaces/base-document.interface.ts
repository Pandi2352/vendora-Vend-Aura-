import { Types } from 'mongoose';

export interface IBaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  isActive: boolean;
}

export interface ITenantBaseDocument extends IBaseDocument {
  tenantId: Types.ObjectId;
}

