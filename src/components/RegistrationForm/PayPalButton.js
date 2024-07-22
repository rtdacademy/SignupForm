import React from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButton = ({ amount, onSuccess }) => {
  return (
    <div>
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount,
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            onSuccess(details);
          });
        }}
        onError={(err) => {
          console.error("PayPal Checkout onError", err);
        }}
      />
    </div>
  );
};

export default PayPalButton;
