import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { bkashController } from "./controllers/bkashController";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ origin: true, preflightContinue: true }));
app.use(express.json());

app.use('/bkash', bkashController);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
