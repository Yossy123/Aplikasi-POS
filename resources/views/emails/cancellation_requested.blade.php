<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Permintaan Pembatalan Pesanan</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #4f46e5, #4338ca); color: #ffffff; padding: 24px; text-align: center; }
        .header h2 { margin: 0; font-size: 20px; font-weight: 700; }
        .content { padding: 24px; }
        .badge { display: inline-block; padding: 4px 10px; background-color: #fee2e2; color: #991b1b; border-radius: 6px; font-weight: 600; font-size: 12px; }
        .info-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .info-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .info-table td.label { font-weight: 600; color: #64748b; width: 35%; }
        .info-table td.value { color: #0f172a; }
        .footer { padding: 16px; text-align: center; background: #f8fafc; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>⚠️ Permintaan Pembatalan Pesanan</h2>
        </div>
        <div class="content">
            <p>Halo Admin,</p>
            <p>Seorang kasir baru saja mengajukan <strong>permintaan pembatalan</strong> melalui sistem POS.</p>
            
            <table class="info-table">
                <tr>
                    <td class="label">Nama Kasir</td>
                    <td class="value">{{ $cancellation->user->name ?? 'Kasir' }}</td>
                </tr>
                <tr>
                    <td class="label">Warung / Cabang</td>
                    <td class="value">{{ $cancellation->warung_name }}</td>
                </tr>
                <tr>
                    <td class="label">Tipe Pembatalan</td>
                    <td class="value"><span class="badge">{{ strtoupper($cancellation->type) }}</span></td>
                </tr>
                <tr>
                    <td class="label">Detail / Alasan</td>
                    <td class="value">{{ $cancellation->details ?: '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Waktu Pengajuan</td>
                    <td class="value">{{ optional($cancellation->created_at)->format('d M Y H:i:s') ?? now()->format('d M Y H:i:s') }}</td>
                </tr>
            </table>

            <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
                Silakan buka dasbor aplikasi POS untuk menyetujui atau menolak permintaan pembatalan ini.
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Simple POS System. Automated Notification.
        </div>
    </div>
</body>
</html>
