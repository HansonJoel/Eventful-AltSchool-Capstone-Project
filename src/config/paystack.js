import axios from "axios";
import { ENV } from "../config/env.js";

export const initializePaystackPayment = async ({
  email,
  amount,
  reference,
  callback_url,
}) => {
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount.toString(), // Send exactly what the service gave us
        reference,
        callback_url,
        currency: "NGN",
      },
      {
        headers: {
          Authorization: `Bearer ${ENV.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Paystack Init Error:",
      error.response?.data || error.message,
    );
    throw new Error("Paystack payment initialization failed");
  }
};
