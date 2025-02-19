import mongoose from "mongoose";
import OrderFromBuyer from "../../models/OrderFromBuyer.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import Cart from "../../models/Cart.js";
import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";

function generateOrderNumber() {
  const prefix = "ORD";
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${prefix}${timestamp}${randomSuffix}`;
}

async function create(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to request a quote.",
      });
    }

    let {
      enquiryNumber,
      products,
      deliveryAddress,
      deliveryLocation,
      deliveryLandMark,
      deliveryPincode,
      expectedDeliveryDate,
    } = req.body;

    if (!enquiryNumber) {
      return res
        .status(400)
        .json({ hasError: true, message: "Enquiry number is required." });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ hasError: true, message: "At least one product is required." });
    }

    const selectedCartIds = products.map((p) => p.cartId);
    if (selectedCartIds.includes(undefined) || selectedCartIds.includes(null)) {
      return res.status(400).json({
        hasError: true,
        message: "Each product must have a valid cartId.",
      });
    }

    const carts = await Cart.find({
      _id: { $in: selectedCartIds },
      enquiryNumber,
    });
    if (carts.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: "No carts found for the given enquiry number.",
      });
    }

    const cartMap = new Map(carts.map((cart) => [cart._id.toString(), cart]));
    const existingOrders = await OrderFromBuyer.find({
      cartId: { $in: selectedCartIds },
    }).select("cartId");
    const existingCartIds = new Set(
      existingOrders.map((order) => order.cartId.toString())
    );

    const orderNumber = generateOrderNumber();
    const orderFromBuyerEntries = [];
    const orderDetailsFromSellerEntries = new Map();

    for (const product of products) {
      const cartEntry = cartMap.get(product.cartId);
      if (!cartEntry) {
        return res.status(400).json({
          hasError: true,
          message: `Cart with ID ${product.cartId} not found.`,
        });
      }

      if (!cartEntry.sellerId) {
        return res.status(400).json({
          hasError: true,
          message: `Cart with ID ${product.cartId} is missing a sellerId.`,
        });
      }

      if (existingCartIds.has(product.cartId)) {
        return res.status(400).json({
          hasError: true,
          message: `These Product already present in Order table`,
        });
      }

      orderFromBuyerEntries.push({
        orderNumber,
        schoolId,
        enquiryNumber,
        cartId: product.cartId,
        sellerId: cartEntry.sellerId,
        cartImage: cartEntry.cartImage || null,
        subcategoryName: cartEntry.subcategoryName || "",
        hsnSacc: cartEntry.hsnSacc || "",
        listingRate: cartEntry.listingRate || 0,
        edprowiseMargin: cartEntry.edprowiseMargin || 0,
        quantity: cartEntry.quantity || 0,
        finalRateBeforeDiscount: cartEntry.finalRateBeforeDiscount || 0,
        discount: cartEntry.discount || 0,
        finalRate: cartEntry.finalRate || 0,
        taxableValue: cartEntry.taxableValue || 0,
        cgstRate: cartEntry.cgstRate || 0,
        cgstAmount: cartEntry.cgstAmount || 0,
        sgstRate: cartEntry.sgstRate || 0,
        sgstAmount: cartEntry.sgstAmount || 0,
        igstRate: cartEntry.igstRate || 0,
        igstAmount: cartEntry.igstAmount || 0,
        amountBeforeGstAndDiscount: cartEntry.amountBeforeGstAndDiscount || 0,
        discountAmount: cartEntry.discountAmount || 0,
        gstAmount: cartEntry.gstAmount || 0,
        totalAmount: cartEntry.totalAmount || 0,
      });

      // Store unique sellerId-schoolId pair
      if (!orderDetailsFromSellerEntries.has(cartEntry.sellerId.toString())) {
        orderDetailsFromSellerEntries.set(cartEntry.sellerId.toString(), {
          orderNumber,
          sellerId: cartEntry.sellerId,
          schoolId,
          enquiryNumber,
        });
      }
    }

    if (orderFromBuyerEntries.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "No valid products to add to Order.",
      });
    }

    // Insert OrderFromBuyer entries
    const savedEntries = await OrderFromBuyer.insertMany(
      orderFromBuyerEntries,
      { session }
    );

    // Insert OrderDetailsFromSeller entries
    const orderDetailsList = Array.from(orderDetailsFromSellerEntries.values());
    await OrderDetailsFromSeller.insertMany(orderDetailsList, { session });

    await QuoteRequest.findOneAndUpdate(
      { schoolId, enquiryNumber },
      [
        {
          $set: {
            deliveryAddress: { $ifNull: [deliveryAddress, "$deliveryAddress"] },
            deliveryLocation: {
              $ifNull: [deliveryLocation, "$deliveryLocation"],
            },
            deliveryLandMark: {
              $ifNull: [deliveryLandMark, "$deliveryLandMark"],
            },
            deliveryPincode: { $ifNull: [deliveryPincode, "$deliveryPincode"] },
            expectedDeliveryDate: {
              $ifNull: [expectedDeliveryDate, "$expectedDeliveryDate"],
            },
            buyerStatus: "Order Placed",
            supplierStatus: "Order Received",
            edprowiseStatus: "Order Placed From Buyer To Supplier",
          },
        },
      ],
      { session, upsert: true, new: true }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      hasError: false,
      message: "Selected products added to Order successfully.",
      data: savedEntries,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating OrderFromBuyer:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message: "Duplicate entry: These products are already in the Order.",
      });
    }

    return res
      .status(500)
      .json({ hasError: true, message: "Internal server error." });
  }
}

export default create;
