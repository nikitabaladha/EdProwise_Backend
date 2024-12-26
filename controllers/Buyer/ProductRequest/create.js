import ProductRequest from "../../../models/Buyer/ProductRequest.js";
import ProductRequestValidator from "../../../validators/Buyer/ProductRequestValidator.js";
import Counter from "../../../models/Buyer/Counter.js";

async function create(req,res) {
    try {
        const { error } =
          ProductRequestValidator.ProductRequestCreateValidator.validate(req.body);
    
        if (error?.details?.length) {
          const errorMessages = error.details.map((err) => err.message).join(", ");
          return res.status(400).json({ hasError: true, message: errorMessages });
        }
    
        const {
          productName,
          productDescription,
          unitsQuantity,
          productQuantity,
          deliveryExpectedDate,
          deliveryAddress,
          deliveryLocation,
          pinCode,
          quoteStatus
        } = req.body;
    
        if (!req.files || !req.files.productImage) {
          return res.status(400).json({
            hasError: true,
            // message: "Sch Photo is required.",
          });
        }
    
 
        const productImagePath = "/Images/BuyerProductRequest";
        const productImage = `${productImagePath}/${req.files.productImage[0].filename}`;
    
        const counter = await Counter.findOneAndUpdate(
          { _id: "EnquiryIdCounter" },
          { $inc: { sequenceValue: 1 } },
          { new: true, upsert: true }
        );
    
        const nextEnquiryId = `ENQ${counter.sequenceValue
          .toString()
          .padStart(6, "0")}`;
    
        const newProductRequest = new ProductRequest({
          enquiryNo: nextEnquiryId,
          productName,
          productDescription,
          productImage,
          unitsQuantity,
          productQuantity,
          deliveryExpectedDate,
          deliveryAddress,
          deliveryLocation,
          pinCode,
          quoteStatus,
        });
    
        await newProductRequest.save();
    
        return res.status(201).json({
          message: "Product Request created successfully!",
          data: newProductRequest,
          hasError: false,
        });
      } catch (error) {
        console.error("Error creating Product Request:", error);
        return res.status(500).json({
          message: "Failed to create Product Request.",
          error: error.message,
        });
      }
}

export default create;