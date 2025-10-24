  import mongoose from 'mongoose';

  const { Schema } = mongoose;

  const schoolFeesCounterSchema = new Schema({
    schoolId: { type: String, required: true, unique: true },
    receiptSeq: { type: Number, default: 0 }
  });

  export const SchoolFeesCounter = mongoose.model('SchoolFeesCounter', schoolFeesCounterSchema);

  const schoolFeesSchema = new Schema({
    schoolId: { type: String, required: true },
    studentAdmissionNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    className: { type: String, required: true, ref: 'ClassAndSection' },
    section: { type: String, required: true, ref: 'ClassAndSection.sections' },
    receiptNumber: { type: String, index: true },
    transactionNumber: { type: String },
    paymentMode: { type: String, required: true },
    collectorName: { type: String, required: true },
    bankName: { type: String, required: false },
    chequeNumber: { type: String },
    academicYear: { type: String, required: true },
    paymentDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    previousReceipt: { type: Schema.Types.ObjectId, ref: 'SchoolFees' },
    
    status: { type: String, enum: ['Pending', 'Paid', 'Cancelled', 'Cheque Return'], default: 'Paid' },
    additionalComment: { type: String },
    reportStatus: [{ type: String, enum: ['Paid', 'Cancelled', 'Cheque Return',"Refund"] }],
    refundReceiptNumbers: [{ type: String }],
    installments: [
      {
        number: { type: Number, required: true },
        installmentName: { type: String, required: true },
        dueDate: { type: Date, required: true },
        excessAmount: { type: Number, default: 0 },
        fineAmount: { type: Number, default: 0 },
        feeItems: [
          {
            feeTypeId: { type: String, ref: 'FeesType', required: true },
            amount: { type: Number, required: true },
            concession: { type: Number, default: 0 },
            payable: { type: Number, required: true },
            paid: { type: Number, default: 0 },
            balance: { type: Number, required: true },
            cancelledPaidAmount: { type: Number, default: 0 } 
          }
        ]
      }
    ]
  }, { timestamps: true });

  schoolFeesSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true });

  schoolFeesSchema.pre('save', async function (next) {
    let attempts = 3;
    while (attempts > 0) {
      try {
        if (this.isNew && this.status !== 'Pending') {
          this.reportStatus = [this.status];
        } else if (this.isModified('status') && this.status !== 'Pending') {
          if (!this.reportStatus.includes(this.status)) {
            this.reportStatus.push(this.status);
          }
        }

        return next();
      } catch (err) {
        if (err.code === 11000 && err.message.includes('receiptNumber')) {
          attempts--;
          if (attempts === 0) {
            return next(new Error(`Failed to save after multiple attempts: ${err.message}`));
          }
          continue;
        }
        return next(err);
      }
    }
  });

  schoolFeesSchema.pre('findOneAndUpdate', async function (next) {
    try {
      const update = this.getUpdate();
      const newStatus = update.$set?.status;

      if (newStatus && newStatus !== 'Pending') {
        const doc = await this.model.findOne(this.getQuery());
        if (doc) {
          let updateModifications = { ...update };
          if (newStatus === 'Cancelled'||newStatus === 'Cheque Return') {
            const updatedInstallments = doc.installments.map(installment => {
              const updatedFeeItems = installment.feeItems.map(feeItem => ({
                ...feeItem.toObject(),
                cancelledPaidAmount: feeItem.paid 
              }));
              return { ...installment.toObject(), feeItems: updatedFeeItems };
            });

            updateModifications.$set = {
              ...updateModifications.$set,
              installments: updatedInstallments
            };
          }

          if (!doc.reportStatus.includes(newStatus)) {
            updateModifications = {
              ...updateModifications,
              $push: { reportStatus: newStatus }
            };
          }

          this.setUpdate(updateModifications);
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  });

  export const SchoolFees = mongoose.model('SchoolFees', schoolFeesSchema);