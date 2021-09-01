import React from 'react';
import styled from "styled-components";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { createSetupIntent } from "../services/stripe.service";

const Form = styled.form`
  width: 620px;
  align-self: center;
  box-shadow: 0px 0px 0px 0.5px rgba(50, 50, 93, 0.1),
    0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07);
  border-radius: 7px;
  padding: 40px;

  @media (max-width: 620px) {
    width: 350px !important;
    padding: 5px;
  }


  @media (max-width: 400px) {
    width: 300px !important;
    padding: 5px;
  }
`

const SuccessBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  align-items: center;
  width: 100%;

  -webkit-animation: fadein 1s; /* Safari, Chrome and Opera > 12.1 */
    -moz-animation: fadein 1s; /* Firefox < 16 */
    -ms-animation: fadein 1s; /* Internet Explorer */
    -o-animation: fadein 1s; /* Opera < 12.1 */
    animation: fadein 1s;

    @keyframes fadein {
        from { opacity: 0; }
        to   { opacity: 1; }
    }

    /* Firefox < 16 */
    @-moz-keyframes fadein {
        from { opacity: 0; }
        to   { opacity: 1; }
    }

    /* Safari, Chrome and Opera > 12.1 */
    @-webkit-keyframes fadein {
        from { opacity: 0; }
        to   { opacity: 1; }
    }

    /* Internet Explorer */
    @-ms-keyframes fadein {
        from { opacity: 0; }
        to   { opacity: 1; }
    }

    /* Opera < 12.1 */
    @-o-keyframes fadein {
        from { opacity: 0; }
        to   { opacity: 1; }
    }
`


const Button = styled.button<{ disabled: boolean }>`
  background: #5469d4;
  font-family: Arial, sans-serif;
  color: #ffffff;
  border-radius: 0 0 4px 4px;
  border: 0;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: block;
  transition: all 0.2s ease;
  box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
  width: 100%;

  ${props => props.disabled && ` 
    opacity: 0.5;
    cursor: default;
  `}

  :hover {
    filter: contrast(115%);
  }
`

const Spinner = styled.div`
  color: #ffffff;
  font-size: 22px;
  text-indent: -99999px;
  margin: 0px auto;
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 2px;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);

  :before  {
    width: 10.4px;
    height: 20.4px;
    background: #5469d4;
    border-radius: 20.4px 0 0 20.4px;
    top: -0.2px;
    left: -0.2px;
    -webkit-transform-origin: 10.4px 10.2px;
    transform-origin: 10.4px 10.2px;
    -webkit-animation: loading 2s infinite ease 1.5s;
    animation: loading 2s infinite ease 1.5s;

    border-radius: 50%;
    position: absolute;
    content: "";
  }
  
  :after {
    width: 10.4px;
    height: 10.2px;
    background: #5469d4;
    border-radius: 0 10.2px 10.2px 0;
    top: -0.1px;
    left: 10.2px;
    -webkit-transform-origin: 0px 10.2px;
    transform-origin: 0px 10.2px;
    -webkit-animation: loading 2s infinite ease;
    animation: loading 2s infinite ease;

    border-radius: 50%;
    position: absolute;
    content: "";
  }
  
  @keyframes loading {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  
  @media only screen and (max-width: 600px) {
    form {
      width: 80vw;
    }
  }
`

const ErrorText = styled.div`
  font-size: 12px;
  font-weight: 500;
  line-height: 12px;
  margin-top: 10px;
`

const SuccessText = styled.div`
  font-size: 12px;
  font-weight: 500;
  line-height: 12px;
  margin-top: 10px;
`
const PhoneBox = styled.div`
  position: relative;
`

const PhoneIcon = styled.img`
  position: absolute;
  top: 10px;
  left: 12px;
  width: 22px;
  height: 22px;
`

const PhoneInput = styled.input`
  padding: 10px 45px;
  height: 20px;
  width: calc(100% - 92px);
  background-color: white;
  border: 1px solid rgba(50, 50, 93, 0.1);
  border-bottom: none;
  border-radius: 4px 4px 0px 0px;
  box-shadow: 0 0px 3px 0 #e6ebf1;
  -webkit-transition: box-shadow 150ms ease;
  transition: box-shadow 150ms ease;
  font-size: "16px";

  :focus {
    box-shadow: 0 1px 3px 0 #cfd7df;
    outline: none;
  }
`


type CardSetupFormProps = {
  hash: string
}

const CardSetupForm = (props: CardSetupFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = React.useState('');
  const [disabled, setDisabled] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [succeeded, setSucceeded] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [phoneNumber, setPhoneNumber] = React.useState(null);

  const validatePhoneNumber = (phoneNumer: string): boolean => {
    var re = /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/;
    return re.test(phoneNumer);
  }
  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: 'Epilogue-Regular, Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#32325d"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    }
  };

  // Create SetupIntent as soon as the page loads
  const getData = async () => {
    const res = await createSetupIntent();
    if (res.statusCode == 200) {
      setClientSecret(res.data.clientSecret);
    }
  }

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();
    setError(null);
    setProcessing(true);

    const isPhoneCorrect = validatePhoneNumber(phoneNumber);
    let sanitizedNumber = phoneNumber;
    if (isPhoneCorrect) {
      // do your logic
    } else {
      setError(`Invalid phone number.`);
      setProcessing(false);
      return;
    }

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          phone: sanitizedNumber
        },
      }
    });

    if (result.error) {
      setError(`Card not saved. ${result.error.message}`);
      console.log("Setup intent failed", result.error);
      (window as any).dataLayer.push({event: "setup_intent_stripe_failed"});
    } else {
      setError(null);
      setSucceeded(true);
      console.log("Setup intent success");
      console.log(result);
      (window as any).dataLayer.push({event: "setup_intent_stripe"});
      // The setup has succeeded. Display a success message and send
      // result.setupIntent.payment_method to your server to save the
      // card to a Customer
    }

    setProcessing(false);
  };

  const handleChange = async (event) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  // Retrieve setup intent
  React.useEffect(() => {
    (window as any).dataLayer.push({event: "view_match_paiement_si"});
    getData();
  }, []);

  return (
    <Form onSubmit={handleSubmit}>
      { succeeded &&
      <SuccessBox>
        <SuccessText>
          Card succesfully saved. 
        </SuccessText>
        </SuccessBox>
      }
  
      <PhoneBox>
        <PhoneInput 
          type="tel" 
          id="phone"
          name="phone" 
          placeholder="Phone number"
          onChange={(e) => setPhoneNumber(e.target.value)} />
      </PhoneBox>
      <CardElement id="stripe-card-element" options={cardStyle} onChange={handleChange} />

      <Button 
        disabled={processing || disabled || succeeded}>
        <span id="button-text">
          {processing ? 
            <Spinner />
           :
            "Save my card"
          }
        </span>
      </Button>
      { error && 
          <ErrorText>
            {error}
          </ErrorText>
      }
    </Form>
  );
}

export default CardSetupForm;
