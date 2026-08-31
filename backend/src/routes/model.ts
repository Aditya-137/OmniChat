import { Router } from "express";
import { controlModel } from "../controllers/chatInput";

const chatRouter = Router();

chatRouter.get("/", controlModel);
// chatRouter.get("/all", getAllModels);

export default chatRouter;