// client/src/components/MembershipCard.tsx
import { useEffect, useState } from "react";
import { getMyMembership, markMembershipPaid } from "../api/membership";

export default function MembershipCard() {
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMembership = async () => {
            try {
                const data = await getMyMembership();
                setMembership(data);
            } catch (err) {
                console.error(err);
                setError("Ei voitu ladata jäsenmaksun tietoja.");
            } finally {
                setLoading(false);
            }
        };
        loadMembership();
    }, []);

    const handleMarkPaid = async () => {
        try {
            setSubmitLoading(true);
            const data = await markMembershipPaid();
            setMembership(data);
        } catch (err) {
            console.error(err);
            setError("Virhe tallennettaessa tietoja.");
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div>Ladataan...</div>;
    if (!membership) return <div>Ei tietoja jäsenmaksusta.</div>;

    const { status, markedPaidAt, confirmedAt } = membership;

    return (
        <div className="membership-card">
            <h3>Jäsenmaksu {new Date().getFullYear()}</h3>

            <p>
                <strong>Tila:</strong>{" "}
                {status === "unpaid" && <span style={{ color: "darkred" }}>Ei maksettu</span>}
                {status === "pending" && <span style={{ color: "orange" }}>Odottaa vahvistusta</span>}
                {status === "paid" && <span style={{ color: "green" }}>Maksettu</span>}
            </p>

            {markedPaidAt && (
                <p>
                    Ilmoitettu maksetuksi:{" "}
                    {new Date(markedPaidAt).toLocaleDateString("fi-FI")}
                </p>
            )}

            {confirmedAt && (
                <p>
                    Vahvistettu:{" "}
                    {new Date(confirmedAt).toLocaleDateString("fi-FI")}
                </p>
            )}

            {/* Unpaid → show button */}
            {status === "unpaid" && (
                <button onClick={handleMarkPaid} disabled={submitLoading}>
                    {submitLoading ? "Tallennetaan..." : "Olen maksanut"}
                </button>
            )}

            {/* Pending → no button */}
            {status === "pending" && (
                <p>Tiedot odottavat ylläpidon vahvistusta.</p>
            )}
        </div>
    )
}