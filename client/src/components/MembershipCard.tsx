// client/src/components/MembershipCard.tsx
import { useEffect, useState } from "react";
import { getUserPayments, markMembershipPaid } from "../api/membership";

export default function MembershipCard() {
    const [membership, setMembership] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

        const loadMembership = async () => {
            try {
                const data = await getUserPayments();
                console.log("дата по членским взносам: ",data);
                setMembership(data);
            } catch (err) {
                console.error(err);
                setError("Ei voitu ladata jäsenmaksun tietoja.");
            } finally {
                setLoading(false);
            }
        };
    useEffect(() => {
        loadMembership();
    }, []);

    const handleMarkPaid = async (paymentId) => {
        await markMembershipPaid(paymentId);
        loadMembership(); // обновляем UI
    };

    if (loading) return <div>Ladataan...</div>;
    if (membership.length === 0)
        return <p>Ei tietoja jäsenmaksusta.</p>;

    return (
        <div className="w3-card w3-padding w3-light-grey w3-round">
            <h3>Jäsenmaksu</h3>

            {membership.map((p) => (
                <div
                    key={p.id}
                    className="w3-padding w3-margin-bottom w3-white w3-round w3-border"
                >
                    <p>
                        <strong>Vuosi:</strong> {p.year}
                    </p>
                    <p>
                        <strong>Tila:</strong>{" "}
                        {p.status === "unpaid" ? "❌ Ei maksettu" : "✔️ Maksettu"}
                    </p>

                    {p.status === "unpaid" && (
                        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            Olen maksanut jäsenmaksun
                            <input
                                type="checkbox"
                                onChange={() => handleMarkPaid(p.id)}
                                style={{ width: "16px", height: "16px", accentColor: "#f0f0f0", opacity: 0.5 }}
                            />
                        </label>
                    )}

                    {p.status === "pending" && (
                        <p className="w3-text-orange">
                            🧭 Odottaa ylläpitäjän vahvistusta…
                        </p>
                    )}

                    {p.status === "paid" && (
                        <p className="w3-text-green">✅ Hyväksytty ✔</p>
                    )}
                </div>
            ))}
        </div>
    )
}