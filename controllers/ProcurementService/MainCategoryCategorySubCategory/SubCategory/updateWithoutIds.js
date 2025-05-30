import SubCategory from "../../../../models/ProcurementService/SubCategory.js";
import Category from "../../../../models//ProcurementService/Category.js";
import MainCategory from "../../../../models/ProcurementService/MainCategory.js";
import SubCategoryValidator from "../../../../validators/ProcurementService/SubCategoryValidator.js";

async function update(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "SubCategory ID is required.",
      });
    }

    const { error } =
      SubCategoryValidator.SubCategoryValidatorWithoutIds.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const { subCategoryName, categoryName, mainCategoryName } = req.body;

    let subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({
        hasError: true,
        message: "SubCategory not found.",
      });
    }

    let mainCategory = await MainCategory.findOneAndUpdate(
      { mainCategoryName },
      { mainCategoryName },
      { new: true, upsert: true }
    );

    let category = await Category.findOneAndUpdate(
      { categoryName, mainCategoryId: mainCategory._id },
      { categoryName, mainCategoryId: mainCategory._id },
      { new: true, upsert: true }
    );

    const subCategoryExists = await SubCategory.findOne({
      _id: { $ne: id },
      subCategoryName,
      categoryId: category._id,
      mainCategoryId: mainCategory._id,
    });

    if (subCategoryExists) {
      return res.status(400).json({
        hasError: true,
        message:
          "A Sub Category with the same name already exists under this Category.",
      });
    }

    subCategory.subCategoryName = subCategoryName;
    subCategory.categoryId = category._id;
    subCategory.mainCategoryId = mainCategory._id;

    await subCategory.save();

    return res.status(200).json({
      hasError: false,
      message: "Sub Category updated successfully.",
      data: subCategory,
    });
  } catch (error) {
    console.error("Error updating Sub Category:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "A Sub Category with the same name already exists in the same Category.",
        hasError: true,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to update Sub Category.",
      error: error.message,
    });
  }
}

export default update;
