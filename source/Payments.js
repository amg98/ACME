const paypal = require("paypal-rest-sdk");

module.exports.createPayment = ({ successURL, cancelURL, itemList, amount, description }) => {
    return new Promise((resolve, reject) => {
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": successURL,
                "cancel_url": cancelURL
            },
            "transactions": [{
                "item_list": {
                    "items": itemList
                },
                "amount": amount,
                "description": description
            }]
        };

        paypal.payment.create(create_payment_json, (error, payment) => {
            if (error) {
                reject(error);
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        resolve({
                            paymentURL: payment.links[i].href, 
                            paymentID: payment.id
                        });
                    }
                }
            }
        });
    });
};

module.exports.executePayment = ({ payerID, paymentID, amount }) => {
    return new Promise((resolve, reject) => {
        const execute_payment_json = {
            "payer_id": payerID,
            "transactions": [{
                "amount": amount
            }]
        };

        paypal.payment.execute(paymentID, execute_payment_json, (error, payment) => {
            if (error) {
                reject(error);
            } else {
                resolve(payment);
            }
        });
    });
};
