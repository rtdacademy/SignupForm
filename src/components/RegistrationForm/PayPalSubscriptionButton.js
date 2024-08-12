import React from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

const PayPalSubscriptionButton = ({ plan, onSuccess, paymentDates }) => {
  const createSubscription = (data, actions) => {
    return actions.subscription.create({
      plan: {
        product: {
          name: plan.courseName,
          description: plan.description
        },
        name: `${plan.courseName} - ${plan.name}`,
        billing_cycles: [
          {
            frequency: {
              interval_unit: "DAY",
              interval_count: 1
            },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 1,
            pricing_scheme: {
              fixed_price: {
                value: plan.initialPayment.toFixed(2),
                currency_code: "CAD"
              }
            }
          },
          ...paymentDates.map((date, index) => ({
            frequency: {
              interval_unit: "DAY",
              interval_count: 1
            },
            tenure_type: "REGULAR",
            sequence: index + 2,
            total_cycles: 1,
            pricing_scheme: {
              fixed_price: {
                value: plan.installmentAmount.toFixed(2),
                currency_code: "CAD"
              }
            }
          }))
        ]
      },
      application_context: {
        shipping_preference: 'NO_SHIPPING'
      },
      custom_id: `Course: ${plan.courseName}, Type: ${plan.studentType}`
    });
  };

  return (
    <div>
      <PayPalButtons
        createSubscription={createSubscription}
        onApprove={(data, actions) => {
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
        }}
        onError={(err) => {
          console.error("PayPal Subscription onError", err);
        }}
        style={{
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        }}
      />
    </div>
  );
};

export default PayPalSubscriptionButton;