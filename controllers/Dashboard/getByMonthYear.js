import SchoolRegistration from "../../models/School.js";
import SellerProfile from "../../models/SellerProfile.js";
import mongoose from "mongoose";

async function getByMonthYear(req, res) {
  try {
    const { year } = req.params;
    const selectedYear = parseInt(year) || new Date().getFullYear();

    // Aggregate pipeline for Schools
    const schoolData = await SchoolRegistration.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`),
            $lt: new Date(`${selectedYear + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const sellerData = await SellerProfile.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`),
            $lt: new Date(`${selectedYear + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      schools: 0,
      sellers: 0,
    }));

    schoolData.forEach(({ _id, count }) => {
      result[_id - 1].schools = count;
    });

    sellerData.forEach(({ _id, count }) => {
      result[_id - 1].sellers = count;
    });

    return res.status(200).json({
      message: "Data fetched successfully",
      data: result,
      hasError: false,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      message: "Failed to fetch data.",
      error: error.message,
      hasError: true,
    });
  }
}

export default getByMonthYear;
