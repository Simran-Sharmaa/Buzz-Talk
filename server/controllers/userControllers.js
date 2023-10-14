const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;
    //  if  user already exists
    const userNamecheck = await User.findOne({ userName });
    if (userNamecheck)
      return res.json({ msg: "Username already exist", status: false });
    const userEmailcheck = await User.findOne({ email });
    if (userEmailcheck)
      return res.json({ msg: "Email already exist", status: false });

    const hashedPassword = await bcrypt.hash(password.toString(), 10);

    const newuser = await User.create({
      email,
      userName,
      password: hashedPassword,
    });
    // don't need to return the password
    // delete newuser.password; (it doesn't work for mongo db obj that's why crt new obj )
    const newuserWithoutPassword = { ...newuser._doc };
    delete newuserWithoutPassword.password;
    return res.json({ status: true, user: newuserWithoutPassword });     

    } 
    catch (error) {
        next(error);
    }   
};

module.exports.setAvatar = async(req,res,next)=>{
  try {
    const userId= req.params.id;
    const avataarImage = req.body.image;
    const newuser = await user.findByIdAndUpdate({_id: userId},{
      isAvtaarImageSet:true,
      avataarImage
    });
   
    return res.json({ 
      isSet: newuser.isAvtaarImageSet , 
      image: newuser.avataarImage
    });  
        
    } catch (error) {
        next(error);
    }   
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "userName",
      "avatar",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

