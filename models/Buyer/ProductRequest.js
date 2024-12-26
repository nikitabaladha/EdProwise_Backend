import mongoose from "mongoose";

const ProductRequestSchema =new mongoose.Schema(
  {
    enquiryNo : {type:String, required:true, unique:true},
    productName:{type:String, required:true},
    productDescription:{type:String, required:true},
    productImage:{type:String},
    unitsQuantity:{type:String, required:true},
    productQuantity:{type:Number, required:true},
    deliveryExpectedDate:{type: Date, required: true,},
    deliveryAddress:{type:String, required:true},
    deliveryLocation:{ type: String,required: true,}, //city-state-country
    pinCode:{type:String, required:true},
    quoteStatus:{
        type: String,
        enum: [
          "Requested",
          "Quote Received",
          "Order Place",
          "Work In Progress",
          "Ready For Transit",
          "Ready For In-Transit",
          "Delivered"
        ],
        default:"Requested"
    }
},
{ timestamps: true }
)

export default mongoose.model("ProductRequest", ProductRequestSchema);