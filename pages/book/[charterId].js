import { useRouter } from "next/router";
import { useEffect } from "react";

export default function BookingRedirectPage() {
  const router = useRouter();
  const { charterId } = router.query;

  useEffect(() => {
    if (!charterId) return;

    const fetchAndRedirect = async () => {
      try {
        const res = await fetch(`/api/get-booking?charterId=${charterId}`);
        const data = await res.json();

        if (data.error) {
          console.error("Error:", data.error);
          router.replace("/404");
          return;
        }

        const level = parseInt(data["Security Level"]);
        if (level === 1) {
          router.replace(`/booking/${charterId}`);
        } else if (level === 2) {
          router.replace(`/verify/${charterId}`);
        } else if (level === 3) {
          router.replace(`/id-selfie/${charterId}`);
        } else {
          console.warn("Unknown security level:", level);
          router.replace("/404");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        router.replace("/404");
      }
    };

    fetchAndRedirect();
  }, [charterId, router]);

  return (
    <div style={{ textAlign: "center", padding: "4rem", fontFamily: "Futura PT, sans-serif", color: "#5c656a" }}>
      <h2>Loading Your Charter Info...</h2>
    </div>
  );
}
