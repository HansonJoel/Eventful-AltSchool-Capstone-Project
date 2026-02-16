import * as paymentService from "../services/payment.service.js";

/* ---------------- INITIALIZE PAYMENT ---------------- */
export const initializePayment = async (req, res, next) => {
  try {
    const user = req.user;
    const { eventId } = req.body; // Removed 'amount' since service fetches it

    // Delegate to the service
    const result = await paymentService.initializePaymentService({
      user,
      eventId,
    });

    res.status(200).json({
      success: true,
      ...result, // Spreads 'free', 'ticket', 'transaction', etc.
    });
  } catch (error) {
    next(error);
  }
};

/* ---------------- VERIFY PAYMENT (No Change) ---------------- */
export const verifyPayment = async (req, res, next) => {
  try {
    const user = req.user;
    const { reference, eventId } = req.body;

    const result = await paymentService.verifyPaymentService({
      user,
      reference,
      eventId,
    });

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
};
