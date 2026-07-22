<?php

namespace App\Services\Payment;

class QrisPaymentHandler implements PaymentHandlerInterface
{
    public function validate(array $data): void
    {
        // QRIS is simulated — no additional validation required
    }

    public function process(array $data): array
    {
        return [
            'cash_paid' => null,
            'change' => null,
        ];
    }
}
