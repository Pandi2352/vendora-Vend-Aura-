import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TenantBaseEntity } from '../../../common';

export type JournalEntryDocument = JournalEntry & Document;

@Schema({ _id: false })
export class JournalLine {
  @Prop({ required: true, trim: true })
  accountCode: string;

  @Prop({ required: true, trim: true })
  accountName: string;

  @Prop({ required: true, min: 0, default: 0 })
  debit: number;

  @Prop({ required: true, min: 0, default: 0 })
  credit: number;
}

@Schema({ timestamps: true, collection: 'journal_entries' })
export class JournalEntry extends TenantBaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outletId: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  entryNumber: string;

  @Prop({ type: Date, required: true, default: Date.now, index: true })
  entryDate: Date;

  @Prop({ required: true, enum: ['EXPENSE', 'SALE', 'PURCHASE', 'MANUAL'], default: 'EXPENSE' })
  referenceType: string;

  @Prop({ default: '', trim: true })
  referenceId: string;

  @Prop({ required: true, trim: true })
  narration: string;

  @Prop({ type: [JournalLine], required: true })
  lines: JournalLine[];

  @Prop({ required: true, min: 0 })
  totalDebit: number;

  @Prop({ required: true, min: 0 })
  totalCredit: number;
}

export const JournalEntrySchema = SchemaFactory.createForClass(JournalEntry);
JournalEntrySchema.index({ tenantId: 1, outletId: 1, entryDate: -1 });
JournalEntrySchema.index({ tenantId: 1, entryNumber: 1 }, { unique: true });
JournalEntrySchema.index({ tenantId: 1, 'lines.accountCode': 1 });

