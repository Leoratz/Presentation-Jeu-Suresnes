import express from "express"
import { getSignup } from "../controllers/SignupController.js"

const router = express.Router()

router.put('/signup', getSignup)

export default router