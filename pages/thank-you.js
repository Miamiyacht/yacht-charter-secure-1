export default function ThankYouPage() {
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
      <h1 style={{ fontSize: "2rem", fontWeight: 300, marginBottom: "0.5rem" }}>
        Thank You
      </h1>
      <div style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>✅</div>
      <p style={{ fontSize: "1.1rem", fontWeight: 300, margin: "0.5rem 0" }}>
        Your yacht charter payment has been received successfully.
      </p>
      <p style={{ fontSize: "1.1rem", fontWeight: 300, margin: "0.5rem 0" }}>
        A confirmation email will be sent shortly.
      </p>
      <p style={{ fontSize: "1.1rem", fontWeight: 300, margin: "0.5rem 0" }}>
        We look forward to welcoming you aboard!
      </p>
    </div>
  );
}
