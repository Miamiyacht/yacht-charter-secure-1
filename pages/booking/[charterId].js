import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function CharterBookingPage() {
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

  const handlePayment = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charter_id: booking["Charter ID"],
        email: booking.Email,
        amount: booking["Price USD"],
        description: `Yacht Charter: ${booking.Yacht} on ${booking.Date}`,
        name: booking["Customer Name"]
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
        <title>Secure Your Yacht Charter</title>
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
          .title {
            font-size: 1.25rem;
            font-family: 'Futura PT', sans-serif;
            font-weight: 300;
            margin-bottom: 1rem;
            white-space: nowrap;
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
            transition: background-color 0.3s ease;
          }
          .button:hover {
            background-color: #474e52;
          }
          .paid {
            color: green;
            font-weight: bold;
          }
        `}</style>
      </Head>

      <div className="container">
        <h1 className="title">SECURE YOUR YACHT CHARTER</h1>
        {error && <p>{error}</p>}
        {booking && (
          <>
            <p><strong>Charter ID:</strong> {booking["Charter ID"]}</p>
            <p><strong>Name:</strong> {booking["Customer Name"]}</p>
            <p><strong>Date:</strong> {booking.Date}</p>
            <p><strong>Yacht:</strong> {booking.Yacht}</p>
            <p><strong>Total Price:</strong> ${(booking["Price USD"] / 100).toFixed(2)}</p>
            <p><strong>Status:</strong> <span className={status === "PAID" ? "paid" : ""}>{status}</span></p>

            {status !== "PAID" && (
              <button className="button" onClick={handlePayment}>
                Proceed to Payment
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
