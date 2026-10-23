const User = require('../models/userModel')

// All User 
exports.getAllUsersController = async (req, res) => {
    try {
        const userData = await User.find({}).select('-password')

        return res.status(200).json({
            success: true,
            message: 'Fatchin all user data.',
            userData: userData
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
}

// Single User 
exports.singleUserController = async (req, res) => {
    let { id } = req.params;

    try {
        let singleUserData = await User.findById(id).select('-password')

        if (!singleUserData) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
        return res.status(200).json({
            success: true,
            message: `Fatchin Single User data.`,
            singleUserData
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
}

// Delete User
exports.deleteUserController = async (req, res) => {
    let { id } = req.params;

    try {
        let deleteUserData = await User.findByIdAndDelete(id);

        if (!deleteUserData) {
            return res.status(404).json({
                success: true,
                message: `User Not Found.`
            });
        }
        return res.status(500).json({
            success: true,
            message: `User deleted successfully.`
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
}

// User Update for User (User can update name, phone, city, postalCode, address information)
exports.updateUserController = async (req, res) => {
    let { id } = req.params;
      const { name, phone, city, postalCode, address } = req.body;

    try {
        // let updateUserData = await User.findByIdAndUpdate({ _id: id }, req.body, { new: true }).select('-password');
        const user = await User.findByIdAndUpdate(id, { name, phone, city, postalCode, address }, { new: true, runValidators: true });


          if (!user) {
            return res.status(404).json({
                success: true,
                message: `User Not Found.`
            });
        }
        

          return res.status(200).json({
            success: true,
            message: `User updated successfully done.`,
            user
        });
   

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
}


// User Update for Admin (hold and status)

exports.adminUpdateUserStatusController = async (req, res) => {
    const { id } = req.params;
    const { isHold, status, role } = req.body;

    try {
        const updateData = {};

        // Validate isHold
        if (isHold !== undefined) {
            if (typeof isHold !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'isHold must be true or false.'
                });
            }

            updateData.isHold = isHold;
        }

        // Validate status
        if (status !== undefined) {
            const allowedStatuses = ['active', 'inactive'];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status must be active or inactive.'
                });
            }

            updateData.status = status;
        }

        // Validate role
        if (role !== undefined) {
            const allowedRoles = ['admin', 'user', 'editor', 'vendor'];

            if (!allowedRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Role must be admin, user, editor, or vendor.'
                });
            }

            updateData.role = role;
        }

        // Prevent empty updates
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide isHold, status, or role.'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User updated successfully.',
            user
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
};
