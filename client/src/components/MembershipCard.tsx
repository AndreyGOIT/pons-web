// client/src/components/MembershipCard.tsx
import { useEffect, useState } from "react";
import { getUserPayments, markMembershipPaid } from "../api/membership";

type MembershipPayment = {
    id: number;
    year: number;
    status: "unpaid" | "pending" | "paid";
    createdAt?: string; // приходит с backend
};

export default function MembershipCard() {
    const [membership, setMembership] = useState<MembershipPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const loadMembership = async () => {
        try {
            const data: MembershipPayment[] = await getUserPayments();
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

    const handleMarkPaid = async (paymentId: number) => {
        setSubmitLoading(true);
        try {
            await markMembershipPaid(paymentId);
            await loadMembership();
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div>Ladataan...</div>;
    if (error) return <div className="w3-text-red">{error}</div>;

    return (
        <div className="w3-card w3-padding w3-light-grey w3-round">
            <h3>Jäsenmaksu</h3>

            {membership.map((p) => {
                // 👉 eräpäivä = createdAt + 7 päivää
                const created = p.createdAt ? new Date(p.createdAt) : null;
                const dueDate = created
                    ? new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000)
                    : null;

                const isOverdue =
                    dueDate &&
                    p.status === "unpaid" &&
                    new Date() > dueDate;

                return (
                    <div
                        key={p.id}
                        className="w3-padding w3-margin-bottom w3-white w3-round w3-border"
                    >
                        <p>
                            <strong>Vuosi:</strong> {p.year}
                        </p>

                        <p>
                            <strong>Tila:</strong>{" "}
                            {p.status === "unpaid" && "❌ Ei maksettu"}
                            {p.status === "pending" && "🧭 Odottaa vahvistusta"}
                            {p.status === "paid" && "✅ Hyväksytty"}
                        </p>

                        {/* ===== Maksutiedot ===== */}
                        {p.status === "unpaid" && (
                            <>
                                <div
                                    className={`w3-card w3-padding w3-round-large ${
                                        isOverdue
                                            ? "w3-pale-red w3-border-red"
                                            : "w3-pale-blue w3-border-blue"
                                    }`}
                                    style={{ maxWidth: "320px", margin: "0 auto" }}
                                >
                                    <h4 className="w3-text-red" style={{ marginTop: 0 }}>
                                        Maksutiedot
                                    </h4>

                                    <p>
                                        <strong>Saaja:</strong> Porvoon NYRKKEILYSEURA Ry
                                    </p>
                                    <p>
                                        <strong>IBAN 💳:</strong> FI78 4055 0012 3222 24
                                    </p>
                                    <p>
                                        <strong>Summa:</strong> 25 €
                                    </p>
                                    <p>
                                        <strong>Viitenumero:</strong> 1163
                                    </p>

                                    {dueDate && (
                                        <p
                                            className={` ${
                                                isOverdue ? "w3-text-red" : "w3-text-black"
                                            }`}
                                            style={{ marginTop: "8px" }}
                                        >
                                            <strong>
                                            Eräpäivä:{" "}
                                            </strong>
                                                {dueDate.toLocaleDateString("fi-FI")}
                                            {isOverdue && " (myöhässä)"}
                                        </p>
                                    )}

                                    <button
                                        className="w3-button w3-blue w3-round w3-margin-bottom"
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                `Saaja: Porvoon NYRKKEILYSEURA Ry\nIBAN: FI78 4055 0012 3222 24\nSumma: 25 €\nViitenumero: 1163`
                                            );
                                            alert("Maksutiedot kopioitu leikepöydälle!");
                                        }}
                                    >
                                        Kopioi maksutiedot
                                    </button>
                                </div>

                                {/* ===== Pehmeä подсказка ===== */}
                                <div
                                    className="w3-padding w3-center w3-margin-top w3-margin-bottom membership-pulse"
                                    style={{ maxWidth: "320px", margin: "0 auto" }}
                                >
                                    <label>
                                        Olen maksanut jäsenmaksun{" "}
                                        <input
                                            type="checkbox"
                                            onChange={() => handleMarkPaid(p.id)}
                                            disabled={submitLoading}
                                            style={{
                                                width: "16px",
                                                height: "16px",
                                                accentColor: "#4CAF50",
                                                cursor: "pointer",
                                            }}
                                        />
                                    </label>

                                    <div
                                        className="w3-small w3-text-grey"
                                        style={{ marginTop: "6px" }}
                                    >
                                        Merkitse maksu suoritetuksi, jotta ylläpito voi vahvistaa sen
                                    </div>
                                </div>
                            </>
                        )}

                        {p.status === "pending" && (
                            <p className="w3-text-orange">
                                🧭 Odottaa ylläpitäjän vahvistusta…
                            </p>
                        )}

                        {p.status === "paid" && (
                            <p className="w3-text-green">
                                ✅ Jäsenmaksu on hyväksytty
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}