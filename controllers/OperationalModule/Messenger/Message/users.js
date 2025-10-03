const Users = require("../../../models/User")

const userById = async(req, res) => {
    try{
       const userId = req.params.userId;
       const users = await Users.find({_id: {$ne: userId}});
       const userData = Promise.all(users.map(async (user) => {
        return { user: {email: user.email, name: user.name, profileImage: user.profileImage, role: user.role, receiverId: user._id}}
       }))
       res.status(200).json(await userData);
    } catch (error) {
        console.log('Error', error)
    }
}

module.exports = userById;