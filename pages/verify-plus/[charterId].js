import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function VerifyPlusPage() {
  const router = useRouter();
  const { charterId } = router.query;

  const [booking, setBooking] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!charterId) return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/get-booking?charterId=${charterId}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setBooking(data);
      } catch (err) {
        setErrorMessage("Booking not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [charterId]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("verified") === "true") {
      setIsVerified(true);
      setStep(2);
    }
  }, []);

  const startIdentityVerification = async () => {
    try {
      const res = await fetch("/api/create-verify-plus-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charterId: booking["Charter ID"],
          email: booking.Email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start identity verification.");
      }
    } catch (err) {
      console.error("❌ Error starting verification:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const proceedToPayment = async () => {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charterId: booking["Charter ID"],
          email: booking.Email,
          amount: booking["Price USD"],
          description: `Yacht Charter: ${booking.Yacht} on ${booking.Date}`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create payment session.");
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <Head>
        <title>Secure Your Yacht Charter</title>
        <style>{`
          body {
            margin: 0;
            font-family: 'Futura PT', sans-serif;
            background-color: #f4f4f4;
            font-weight: 300;
          }
          .wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 2rem;
          }
          .card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            max-width: 500px;
            width: 100%;
            color: #5c656a;
            text-align: center;
          }
          .title {
            font-size: 1.25rem;
            font-family: 'Futura PT', sans-serif;
            font-weight: 300;
            margin-bottom: 1rem;
          }
          .button {
            background-color: #5c656a;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-size: 1rem;
            font-weight: 400;
            cursor: pointer;
            margin-top: 20px;
          }
          .button:hover {
            background-color: #474e52;
          }
        `}</style>
      </Head>
      <div className="wrapper">
        <div className="card">
          <h1 className="title">SECURE YOUR YACHT CHARTER</h1>

          {loading && <p>Loading booking details...</p>}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

          {!loading && booking && (
            <>
              <p><strong>Charter ID:</strong> {booking["Charter ID"]}</p>
              <p><strong>Name:</strong> {booking["Customer Name"]}</p>
              <p><strong>Date:</strong> {booking.Date}</p>
              <p><strong>Yacht:</strong> {booking.Yacht}</p>
              <p><strong>Total Price:</strong> ${(booking["Price USD"] / 100).toFixed(2)}</p>

              {step === 1 && (
                <>
                  <p>Please verify your identity before proceeding to payment.</p>
                  <button className="button" onClick={startIdentityVerification}>
                    Start Identity Verification
                  </button>
                </>
              )}

              {step === 2 && isVerified && (
                <>
                  <p style={{ color: "green" }}>Card Uploaded ✅</p>
                  <p style={{ color: "green" }}>Identity Submitted ✅</p>
                  <button className="button" onClick={proceedToPayment}>
                    Proceed to Payment
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
