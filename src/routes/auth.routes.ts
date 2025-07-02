import { Router } from "express";

import { signin, signup } from "../controllers/auth.controller";

const router = Router()

router.route("/sign-up").post(signup)
router.route("/sign-in").post(signin)

export default router