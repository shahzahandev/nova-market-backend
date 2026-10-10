const mongoose = require("mongoose");
const Category = require("../models/categoryModels");


// Category controller
exports.createCategoryController = async (req, res) => {
  const { name } = req.body
  try {

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is requred'
      });
    }

    const normalizedName = name.trim().toLowerCase();

    const existingCategory = await Category.findOne({
      name: normalizedName
    });


    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'This Catagorey already exists'
      })
    }


    let category = new Category({
      name: normalizedName
    })
    await category.save();

    return res.status(201).json({
      success: true,
      messege: 'Category created',
      category
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

exports.getAllCategoryController = async (req, res) => {
  try {
    const allCategory = await Category.find({});

    return res.status(200).json({
      success: true,
      message: 'Fetching all categoryes',
      total: `${allCategory.length} Category`,
      allCategory
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

exports.getAllActiveCategoryController = async (req, res) => {
  try {
    const allActiveCategory = await Category.find({ status : "active" }).sort();

    return res.status(200).json({
      success: true,
      message: 'Fetching all Active categoryes',
      active : `${allActiveCategory.length} Category`,
      allActiveCategory
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

exports.deleteCategroyController = async (req, res) => {
  try {
    const { id } = req.params


    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const deleteCategroy = await Category.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Categroy deleted succesfully"
    })

  } catch (error) {

  }
}

exports.updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    // id valid kina check
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category id'
      });
    }

    // kono field na pathale update er kichu nei
    if (name === undefined && status === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Provide name or status to update'
      });
    }

    const updateData = {};

    // name update
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      const normalizedName = name.trim().toLowerCase();

      // nijer id bade onno kothao same name ache kina
      const duplicate = await Category.findOne({
        name: normalizedName,
        _id: { $ne: id }
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'This category already exists'
        });
      }

      updateData.name = normalizedName;
    }

    // status update
    if (status !== undefined) {
      if (!['active', 'hold'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be 'active' or 'hold'"
        });
      }
      updateData.status = status;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};