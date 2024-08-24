import { User } from '../models/users.model.js';
import { uploadOnCloudinary } from '../utils/cloudinaryUpload.js'
import { ApiError } from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js'

const generateAccessAndRefreshAccess = async (userId) => {
  try {

    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}
    
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access token")
    
  }
}

const registerUser = async (req, res) => {
  //get user details from frontend
  //validation of the input fields
  //check if user alreasdy exits in the database:username, email
  //check for images, avatar
  //upload them to cloudinary
  //create user object - create entry in the db
  //check for user creation
  //remove password, refresh token field from response
  //return res

  const { fullName, email, password, userName } = req.body;

  // console.log(fullName, email, password);

  //check if anything is empty
  if (  [fullName, email, userName, password].some((field) => {return field?.trim() === '';}) ) {
    throw new ApiError(400, 'All fileds are required');
  }

  //check user already exists
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if(existedUser){
    throw new ApiError(409,"User with email or username already exists")
  }

  //check for files from frontend
  // console.log(req.files)
  const avatarLocalPath = req.files?.avatar[0]?.path
  // let coverImageLocalPath = req.files?.coverImage[0]?.path //TypeError: Cannot read properties of undefined (reading '0')

  let coverImageLocalPath
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar File is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)


  if(!avatar){
    throw new ApiError(400,"Avatar File is required")
  }

  //entry of user in database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName
  })

  //check for user creation and remove password, refresh token
  const createdUser = await User.findById(user._id).select("-password -refreshToken") //unselect password and refreshToken

  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
  }

  console.log("User registered successfully")

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )




}

const loginUser = async (req,res)=>{
  //get email/username and password
  //validation of input fields
  //verify the data using db
  //access and refresh token
  //send cookie and res
  const {email, userName, password} = req.body
  console.log(email, userName,password)

  if(!email && !userName){
    throw new ApiError(400,"Username or email is required")
  }

  const existUser = await User.findOne({$or:[{userName}, {email}]})
  
  if(!existUser){
    throw new ApiError(404,"User does not exists!")
  }

  const isPasswordValid = await existUser.checkUserPassword(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid Password!")
  }
  
  const {accessToken, refreshToken} = await generateAccessAndRefreshAccess(existUser._id)

  existUser.refreshToken = refreshToken
  existUser.password = undefined

  console.log("Logged in Successfully")

  //cookie generation
  const options = {
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(new ApiResponse(200,{user:existUser,accessToken,refreshToken},"User Logged in successfully"))

}

const logoutUser = async(req,res)=>{

  const user = req.user
  
  if(!user){
    throw new ApiError(401,"Unauthorized Access")
  }

  await User.findByIdAndUpdate(req.user._id, {$set:{refreshToken:undefined}},{new:true})


  const options ={
    httpOnly: true,
    secure: true
  }

  console.log("Logged out successsfully")
  return res
  .status(200)
  .clearCookie("accessToken")
  .clearCookie("refreshToken")
  .json(new ApiResponse(200, {}, "User Logged out Successfully"))



}

export { registerUser, loginUser, logoutUser };
