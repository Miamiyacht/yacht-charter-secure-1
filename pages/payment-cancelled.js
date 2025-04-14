export default function PaymentFailedPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f4f4f4",
      fontFamily: "'Futura PT', sans-serif",
      color: "#5c656a",
      padding: "2rem",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "500px",
        background: "white",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        width: "100%"
      }}>
        <h1 style={{ fontWeight: 300 }}>PAYMENT FAILED</h1>
        <div style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>❌</div>
        <p style={{ fontWeight: 300 }}>Your payment was not successful.</p>
        <p style={{ fontWeight: 300 }}>This may be due to a declined card or incorrect card details.</p>
        <p style={{ fontWeight: 300 }}>Please try again or try a different card.</p>
      </div>
    </div>
  );
}
