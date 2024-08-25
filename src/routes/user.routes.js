import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";


const router = Router()

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser)

router.route("/login").post(loginUser)

//secured routes => user should be loggedIn
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-current-password").post(verifyJWT,changeCurrentPassword)


export default router