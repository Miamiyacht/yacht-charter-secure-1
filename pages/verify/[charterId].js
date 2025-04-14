import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function VerifyBookingPage() {
  const router = useRouter();
  const { charterId } = router.query;

  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!charterId) return;
    fetch(`/api/get-booking?charterId=${charterId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setBooking(data);
        setStatus(data.Status || "INCOMPLETE");
      })
      .catch(() => setError("Booking not found."));
  }, [charterId]);

  const handleVerification = async () => {
    const res = await fetch("/api/create-identity-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charter_id: booking["Charter ID"],
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
          h1 {
            font-size: 1.25rem;
            font-family: 'Futura PT', sans-serif;
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
        `}</style>
      </Head>
      <div className="container">
        <h1>SECURE YOUR YACHT CHARTER</h1>
        {error && <p>{error}</p>}
        {booking && (
          <>
            <p><strong>Charter ID:</strong> {booking["Charter ID"]}</p>
            <p><strong>Name:</strong> {booking["Customer Name"]}</p>
            <p><strong>Date:</strong> {booking.Date}</p>
            <p><strong>Yacht:</strong> {booking.Yacht}</p>
            <p><strong>Total Price:</strong> ${(booking["Price USD"] / 100).toFixed(2)}</p>
            <p>Please verify your identity before proceeding to payment.</p>
            <button className="button" onClick={handleVerification}>Start Identity Verification</button>
          </>
        )}
      </div>
    </>
  );
}
