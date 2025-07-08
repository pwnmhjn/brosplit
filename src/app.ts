import express, { NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger';
import authRouter from './routes/auth.routes';
import groupRouter from './routes/group.routes';
import memberRouter from './routes/member.routes';
import expenseRouter from './routes/expense.routes';
import settlementRouter from './routes/settlement.routes';
import profileRouter from './routes/profile.routes';
import { Request, Response } from 'express';
import { ErrorResponse } from './utils/ErrorResponse';
import cookieParser from 'cookie-parser';
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/', (_, res) => {
  res.send('Welcome to BroSplit API!');
});

app.use('/api/v1/auth/users', authRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/group', groupRouter);
app.use('/api/v1/group', memberRouter);
app.use('/api/v1/group', settlementRouter);
app.use('/api/v1/expense', expenseRouter);

app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
    const { statusCode = 500, message } = err;
    res.status(statusCode).json(new ErrorResponse(statusCode, message));
  }
);
export { app };
