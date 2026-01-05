// client/src/components/MembershipCard.tsx
import { useEffect, useState } from "react";
import { getUserPayments, markMembershipPaid } from "../api/membership";
/*import SepaQr from "./SepaQr";*/

// Типизация объекта членского взноса
type MembershipPayment = {
    id: number;
    year: number;
    status: "unpaid" | "pending" | "paid";
};

export default function MembershipCard() {
    const [membership, setMembership] = useState<MembershipPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

        const loadMembership = async () => {
            try {
                const data: MembershipPayment[] = await getUserPayments();
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

    const handleMarkPaid = async (paymentId: number) => {
        setSubmitLoading(true);
        try {
            if (paymentId === 0) {
                // старый пользователь → backend сам создаст запись
                await markMembershipPaid();
            } else {
                await markMembershipPaid(paymentId);
            }
            await loadMembership();
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div>Ladataan...</div>;
    if (error) return <div className="w3-text-red">{error}</div>;

    const currentYear = new Date().getFullYear();

    const paymentsToRender: MembershipPayment[] =
        membership.length === 0
            ? [
                {
                    id: 0, // виртуальный
                    year: currentYear,
                    status: "unpaid",
                },
            ]
            : membership;

    return (
        <div className="w3-card w3-padding w3-light-grey w3-round">
            <h3>Jäsenmaksu</h3>

            {paymentsToRender.map((p) => (
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
                        <div
                            className="w3-card w3-padding w3-pale-blue w3-border-red w3-round-large"
                            style={{ maxWidth: "320px", margin: "0 auto" }}
                        >
                            <h4 className="w3-text-red" style={{ marginTop: 0 }}>
                                Maksutiedot
                            </h4>

                            <p>
                                <strong>Saaja:</strong> Porvoon Nyrkkeilyseura Ry
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

                            {/* QR-код */}
                            {/*<SepaQr
                                name="Porvoon Nyrkkeilyseura Ry"
                                iban="FI7840550012322224"
                                amount={25}
                                reference="1163"
                                message="Jäsenmaksu vuodelle 2025"
                            />*/}

                            {/* Копировать реквизиты */}
                            <button
                                className="w3-button w3-blue w3-round w3-margin-bottom"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `Saaja: Porvoon Nyrkkeilyseura Ry\nIBAN: FI78 4055 0012 3222 24\nSumma: 25 €\nViitenumero: 1163`
                                    );
                                    alert("Maksutiedot kopioitu leikepöydälle!");
                                }}
                            >
                                Kopioi maksutiedot
                            </button>

                            {/*<p style={{ fontSize: "12px", marginTop: "8px" }}>
                                Skannaa QR-koodi sovelluksella tai käytä yllä olevia tietoja
                                manuaalisesti.
                            </p>*/}
                        </div>
                    )}

                    {p.status === "unpaid" && (
                        <div className="container w3-padding" style={{alignItems:"center"}}>
                        <label
                            /*style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "8px",
                            }}*/
                        >
                            Olen maksanut jäsenmaksun {"-> "}
                            <span style={{  padding: "2px", boxShadow: "0 0 0 2px rgba(0,0,0,0.15)", }}>
                            <input
                                type="checkbox"
                                onChange={() => handleMarkPaid(p.id)}
                                style={{
                                    width: "16px",
                                    height: "16px",
                                    accentColor: "#4CAF50",
                                    cursor: "pointer",
                                }}
                                disabled={submitLoading}
                            />
                                </span>
                        </label>
                        </div>
                    )}


                    {p.status === "pending" && (
                        <p className="w3-text-orange">
                            🧭 Odottaa ylläpitäjän vahvistusta…
                        </p>
                    )}

                    {p.status === "paid" && (
                        <p className="w3-text-green">✅ Hyväksytty</p>
                    )}
                </div>
            ))}
        </div>
    )
}