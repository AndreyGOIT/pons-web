// src/components/SepaQr.tsx
import React from "react";
import QRCode from "react-qr-code";

type SepaQrProps = {
    name: string;
    iban: string;
    amount: string | number;
    reference?: string;
    message?: string;
};

const SepaQr: React.FC<SepaQrProps> = ({ name, iban, amount, reference, message }) => {
    // Формируем SEPA-строку по стандарту EPC016-1
    const sepaString =
        `BCD\n` +
        `001\n` +
        `1\n` +
        `SCT\n` +
        `${name}\n` +
        `${iban}\n` +
        `EUR${amount}\n` +
        `${reference ? `RF${reference}` : ""}\n` +
        `${message || ""}\n`;

    return (
        <div style={{ textAlign: "center" }}>
            <QRCode value={sepaString} size={200} />
            <p style={{ fontSize: "14px", marginTop: "8px" }}>
                Skannaa QR-koodi maksua varten
            </p>
        </div>
    );
};

export default SepaQr;