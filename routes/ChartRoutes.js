import express from "express"
import { getChart } from "../controllers/ChartController.js"

const router = express.Router()

router.put('/chart', getChart)

export default router