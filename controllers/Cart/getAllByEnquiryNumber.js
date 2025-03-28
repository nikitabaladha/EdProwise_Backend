import Cart from "../../models/Cart.js";
import SellerProfile from "../../models/SellerProfile.js";

async function getAllByEnquiryNumber(req, res) {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to get cart details.",
      });
    }

    const { enquiryNumber } = req.query;

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "Enquiry number is required.",
      });
    }

    const cartData = await Cart.find({ enquiryNumber })
      .populate({
        path: "sellerId",
        model: "Seller",
        select: "_id",
      })
      .lean();

    if (!cartData.length) {
      return res.status(200).json({
        hasError: false,
        message: "Cart Data retrieved successfully.",
        data: [],
      });
    }

    const sellerIds = cartData
      .map((item) => item.sellerId?._id)
      .filter(Boolean);

    const sellerProfiles = await SellerProfile.find({
      sellerId: { $in: sellerIds },
    })
      .select("sellerId companyName")
      .lean();

    const sellerProfileMap = {};
    sellerProfiles.forEach((profile) => {
      sellerProfileMap[profile.sellerId.toString()] = profile.companyName;
    });

    const formattedData = cartData.map((item) => ({
      ...item,
      companyName:
        sellerProfileMap[item.sellerId?._id?.toString()] || "Unknown",
      sellerId: item.sellerId?._id || item.sellerId,
    }));

    // Grouping data by companyName
    const groupedData = formattedData.reduce((acc, item) => {
      const { companyName } = item;
      if (!acc[companyName]) {
        acc[companyName] = [];
      }
      acc[companyName].push(item);
      return acc;
    }, {});

    return res.status(200).json({
      hasError: false,
      message: "Cart Data retrieved successfully.",
      data: groupedData,
    });
  } catch (error) {
    console.error("Error retrieving Cart Data:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default getAllByEnquiryNumber;
