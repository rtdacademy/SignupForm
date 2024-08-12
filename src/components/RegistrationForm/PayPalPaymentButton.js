import React from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

const PayPalPaymentButton = ({ amount, plan, onSuccess, paymentDates, paymentType }) => {
  const [{ options }, dispatch] = usePayPalScriptReducer();

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
            currency_code: "CAD"
          },
        },
      ],
    });
  };

  const createSubscription = (data, actions) => {
    return actions.subscription.create({
      plan_id: plan.planId, // Use the planId from the plan object
      custom_id: `Course: ${plan.courseName}, Type: ${plan.studentType}`
    });
  };

  React.useEffect(() => {
    dispatch({
      type: "resetOptions",
      value: {
        ...options,
        intent: paymentType === 'subscription' ? 'subscription' : 'capture',
      },
    });
  }, [paymentType]);

  return (
    <PayPalButtons
      createOrder={paymentType === 'subscription' ? undefined : createOrder}
      createSubscription={paymentType === 'subscription' ? createSubscription : undefined}
      onApprove={(data, actions) => {
        if (paymentType === 'subscription') {
          return actions.subscription.get().then((details) => {
            console.log('Subscription approved:', data);
            console.log('Subscription details:', details);
            onSuccess({
              subscriptionID: data.subscriptionID,
              orderId: data.subscriptionID,
              payerId: details.subscriber.payer_id,
              payerEmail: details.subscriber.email_address,
              transactionStatus: details.status,
              transactionTime: details.create_time,
              amount: {
                value: plan.initialPayment.toFixed(2),
                currency_code: "CAD"
              },
              planDetails: plan,
              paymentDates: paymentDates,
              ...details
            });
          });
        } else {
          return actions.order.capture().then((details) => {
            console.log('Capture result', details);
            onSuccess({
              orderId: details.id,
              payerId: details.payer.payer_id,
              payerEmail: details.payer.email_address,
              amount: details.purchase_units[0].amount,
              transactionStatus: details.status,
              transactionTime: details.update_time,
            });
          });
        }
      }}
      onError={(err) => {
        console.error("PayPal Payment onError", err);
      }}
      style={{
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: paymentType === 'subscription' ? 'subscribe' : 'paypal'
      }}
    />
  );
};

export default PayPalPaymentButton;
