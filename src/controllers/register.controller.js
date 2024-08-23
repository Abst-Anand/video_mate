import { User } from '../models/users.model.js';
import { uploadOnCloudinary } from '../utils/cloudinaryUpload.js'
import { ApiError } from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js'

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
  console.log(req.files)
  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path

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

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )




};

export { registerUser };
