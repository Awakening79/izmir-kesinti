import { Router, type IRouter } from "express";
import healthRouter from "./health";
import outagesRouter from "./outages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(outagesRouter);

export default router;
