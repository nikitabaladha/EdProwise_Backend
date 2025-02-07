import Cart from "../../models/Cart.js";
import PrepareQuote from "../../models/PrepareQuote.js";

async function create(req, res) {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to request a quote.",
      });
    }

    let { enquiryNumber, products } = req.body;

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "Enquiry number is required.",
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "At least one product is required.",
      });
    }

    if (typeof products === "string") products = JSON.parse(products);

    const selectedPrepareQuoteIds = products.map((p) => p.prepareQuoteId);

    if (
      selectedPrepareQuoteIds.includes(undefined) ||
      selectedPrepareQuoteIds.includes(null)
    ) {
      return res.status(400).json({
        hasError: true,
        message: "Each product must have a valid prepareQuoteId.",
      });
    }

    const prepareQuotes = await PrepareQuote.find({
      _id: { $in: selectedPrepareQuoteIds },
      enquiryNumber: enquiryNumber,
    });

    const prepareQuoteMap = new Map(
      prepareQuotes.map((pq) => [pq._id.toString(), pq])
    );

    const cartEntries = products.map((product) => {
      const prepareQuoteEntry = prepareQuoteMap.get(product.prepareQuoteId);

      if (!prepareQuoteEntry) {
        return res.status(400).json({
          hasError: true,
          message: `PrepareQuote with ID ${product.prepareQuoteId} not found.`,
        });
      }

      if (!prepareQuoteEntry.sellerId) {
        return res.status(400).json({
          hasError: true,
          message: `PrepareQuote with ID ${product.prepareQuoteId} is missing a sellerId.`,
        });
      }

      return {
        schoolId,
        enquiryNumber,
        prepareQuoteId: product.prepareQuoteId,
        sellerId: prepareQuoteEntry?.sellerId || null,
        cartImage: prepareQuoteEntry?.prepareQuoteImage || null,
        subcategoryName: prepareQuoteEntry?.subcategoryName || "",
        hsnSacc: prepareQuoteEntry?.hsnSacc || "",
        listingRate: prepareQuoteEntry?.listingRate || 0,
        edprowiseMargin: prepareQuoteEntry?.edprowiseMargin || 0,
        quantity: prepareQuoteEntry?.quantity || 0,
        finalRateBeforeDiscount:
          prepareQuoteEntry?.finalRateBeforeDiscount || 0,
        discount: prepareQuoteEntry?.discount || 0,
        finalRate: prepareQuoteEntry?.finalRate || 0,
        taxableValue: prepareQuoteEntry?.taxableValue || 0,
        cgstRate: prepareQuoteEntry?.cgstRate || 0,
        cgstAmount: prepareQuoteEntry?.cgstAmount || 0,
        sgstRate: prepareQuoteEntry?.sgstRate || 0,
        sgstAmount: prepareQuoteEntry?.sgstAmount || 0,
        igstRate: prepareQuoteEntry?.igstRate || 0,
        igstAmount: prepareQuoteEntry?.igstAmount || 0,
        amountBeforeGstAndDiscount:
          prepareQuoteEntry?.amountBeforeGstAndDiscount || 0,
        discountAmount: prepareQuoteEntry?.discountAmount || 0,
        gstAmount: prepareQuoteEntry?.gstAmount || 0,
        totalAmount: prepareQuoteEntry?.totalAmount || 0,
      };
    });

    if (cartEntries.some((entry) => entry.hasError)) {
      return;
    }

    const savedEntries = await Cart.insertMany(cartEntries);

    return res.status(201).json({
      hasError: false,
      message: "Selected products added to cart successfully.",
      data: savedEntries,
    });
  } catch (error) {
    console.error("Error creating Cart:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default create;
