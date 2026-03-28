import express from "express"
import {
  getStudentStats,
  getEmployerStats,
  getEmployerPipeline,
  getAdminStats,
  getRecentActivities,
} from "../controllers/dashboardController.js"
import { protect } from "../middleware/auth.js"
import { checkRole } from "../middleware/rolecheck.js"

const router = express.Router()

// Student dashboard routes
router.get("/student/stats", protect, checkRole(["student"]), getStudentStats)

// Employer dashboard routes
router.get("/employer/stats", protect, checkRole(["employer"]), getEmployerStats)
router.get("/employer/pipeline", protect, checkRole(["employer"]), getEmployerPipeline)

// Admin dashboard routes
router.get("/admin/stats", protect, checkRole(["admin"]), getAdminStats)
router.get("/admin/activities/recent", protect, checkRole(["admin"]), getRecentActivities)

export default router
