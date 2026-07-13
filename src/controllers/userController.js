const User = require('../models/userModelSchema')

// All user data
exports.getAllUsersController = async (req, res) => {
    try {
        const userData = await User.find({})
        return res.send({
            success: true,
            message: 'All user data.',
            userData: userData
        })
    } catch (error) {
        return res.send({
            success: false,
            message: 'Server error.',
            error: error
        })
    }
}

// Single user data
exports.singleUserController = async (req, res) => {
    let { id } = req.params

    try {
        let singleUserData = await User.findById(id)
        return res.send({
            success: true,
            message: `Single User data.`,
            user: singleUserData
        })
    } catch (error) {
        return res.send({
            success: false,
            message: 'Server error.',
            error: error
        })
    }
}

// Delete user
exports.deleteUserController = async (req, res) => {
    let { id } = req.params

    try {
        let deleteUserData = await User.findByIdAndDelete(id)
        return res.send({
            success: true,
            message: `User deleted successfully.`
        })
    } catch (error) {
        return res.send({
            success: false,
            message: 'Server error.',
            error: error
        })
    }
}

// Update user
exports.updateUserController = async (req, res) => {
    let { id } = req.params

    try {
        let updateUserData = await User.findByIdAndUpdate({ _id: id }, req.body, { new: true })
        return res.send({
            success: true,
            message: `User updated successfully done.`,
            updateUser: updateUserData
        })
    } catch (error) {
        return res.send({
            success: false,
            message: 'Server error.',
            error: error
        })
    }
}