import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function VerifyPlusPage() {
  const router = useRouter();
  const { charterId } = router.query;

  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [identitySubmitted, setIdentitySubmitted] = useState(false);

  useEffect(() => {
    if (!charterId) return;

    fetch(`/api/get-booking?charterId=${charterId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setBooking(data);
      })
      .catch(() => setError("Booking not found."));
  }, [charterId]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("verified") === "true") {
      setIdentitySubmitted(true);
    }
  }, []);

  const handleVerify = async () => {
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
  };

  const handlePayment = async () => {
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
  };

  return (
    <>
      <Head>
        <title>Verify Identity - Secure Yacht Charter</title>
        <style>{`
          body {
            margin: 0;
            font-family: 'Futura PT', sans-serif;
            background-color: #f4f4f4;
            font-weight: 300;
          }
          .container {
            max-width: 500px;
            margin: 4rem auto;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            color: #5c656a;
            text-align: center;
          }
          .button {
            background: #5c656a;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 0.75rem 2rem;
            font-size: 1rem;
            margin-top: 1.5rem;
            cursor: pointer;
          }
          .status-line {
            margin: 0.75rem 0;
            font-weight: bold;
            color: green;
          }
        `}</style>
      </Head>
      <div className="container">
        <h1>VERIFY YOUR IDENTITY</h1>
        {error && <p>{error}</p>}
        {booking && (
          <>
            <p><strong>Charter ID:</strong> {booking["Charter ID"]}</p>
            <p><strong>Name:</strong> {booking["Customer Name"]}</p>
            <p><strong>Date:</strong> {booking.Date}</p>
            <p><strong>Yacht:</strong> {booking.Yacht}</p>
            <p><strong>Total Price:</strong> ${(booking["Price USD"] / 100).toFixed(2)}</p>

            {!identitySubmitted ? (
              <>
                <p>Please verify your identity before proceeding to payment.</p>
                <button className="button" onClick={handleVerify}>
                  Start Identity Verification
                </button>
              </>
            ) : (
              <>
                <p className="status-line">Card Uploaded ✅</p>
                <p className="status-line">Identity Submitted ✅</p>
                <button className="button" onClick={handlePayment}>
                  Proceed to Payment
                </button>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
