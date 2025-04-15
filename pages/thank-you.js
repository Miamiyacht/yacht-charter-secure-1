export default function ThankYouPage() {
  return (
    <>
      <style jsx>{`
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
          margin-bottom: 1.5rem;
        }
        p {
          font-family: 'Futura PT', sans-serif;
          font-weight: 300;
        }
        .container {
          max-width: 500px;
          margin: 4rem auto;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          color: #5c656a;
          text-align: center;
        }
      `}</style>

      <div className="container">
        <h1>THANK YOU</h1>
        <div style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>✅</div>
        <p>Your yacht charter payment has been received successfully.</p>
        <p>A confirmation email will be sent shortly.</p>
        <p>We look forward to welcoming you aboard!</p>
        <p>You may now close this browser window.</p>
      </div>
    </>
  );
}
