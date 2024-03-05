import { BkashGateway } from 'bkash-payment-gateway';
import dotenv from "dotenv";

dotenv.config();

const config = {
	baseURL: process.env.BKASH_BASEURL ?? "",
	key: process.env.BKASH_API_KEY ?? "",
	username: process.env.BKASH_USERNAME ?? "",
	password: process.env.BKASH_PASSWORD ?? "",
	secret: process.env.BKASH_API_SECRET ?? ""
};

const bkash = new BkashGateway(config);
export default bkash;