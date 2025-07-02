import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swagger";
import authRouter from "./routes/auth.routes";
import profileRouter from "./routes/profile.routes";
import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "./utils/ErrorResponse";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/", (_, res) => {
  res.send("Welcome to BroSplit API!");
});

app.use("/api/v1/auth/users", authRouter);
app.use("/api/v1/profile", profileRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  let { statusCode = 500, message } = err;
  res.status(statusCode).json(new ErrorResponse(statusCode, message));
});
export { app };
