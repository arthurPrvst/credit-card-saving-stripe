import React from "react";
import styled from "styled-components";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CardSetupForm from "./components/card-setup-form.component";

const Container = styled.div` 
    display: flex;
    flex-direction: column;
    align-items: center;
`

const PaymentBox = styled.div`
    margin-bottom: 70px;
`

const PaymentSiScreen = () => {
    const stripeSecretKey = "TO_CHANGE"
    const stripePromise = loadStripe(stripeSecretKey);
    
    return <Container>

        <PaymentBox style={{ marginTop: 50 }}>
            <Elements stripe={stripePromise}>
                <CardSetupForm />
            </Elements>
        </PaymentBox>

    </Container>
}

export default PaymentSiScreen;
