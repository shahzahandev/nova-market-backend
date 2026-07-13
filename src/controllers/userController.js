const User = require('../models/userModel')


exports.getAllUsersController = async (req, res) => {
    try {
        const userData = await User.find({}).limit(10).select('-password')

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
            user: singleUserData
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

exports.updateUserController = async (req, res) => {
    let { id } = req.params;
    let {email} = req.body

    try {
        let updateUserData = await User.findByIdAndUpdate({ _id: id }, {email}, { new: true });

          if (!updateUserData) {
            return res.status(404).json({
                success: true,
                message: `User Not Found.`
            });
        }

      if(email){
          return res.status(200).json({
            success: true,
            message: `User updated successfully done.`,
            updateUser: {
                email: updateUserData.email,
                id: updateUserData._id,
                role: updateUserData.role
            }
        });
      } else {
         return res.status(400).json({
            success: false,
            message: `You can't update it. It's only for Admin.`
        });
      }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
}