import { upload } from "./../middlewares/multer.middleware";
import { Router } from "express";
import { createProfile } from "../controllers/profile.controller";
import { verifyJwt } from "../middlewares/auth.middleware";

const router = Router();

router
  .route("/create-profile")
  .post(verifyJwt, upload.single("avatar"), createProfile);

export default router;
