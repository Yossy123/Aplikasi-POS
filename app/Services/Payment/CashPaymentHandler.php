<?php

namespace App\Services\Payment;

use Illuminate\Validation\ValidationException;

class CashPaymentHandler implements PaymentHandlerInterface
{
    public function validate(array $data): void
    {
        if (empty($data['cash_paid'])) {
            throw ValidationException::withMessages([
                'cash_paid' => ['Cash paid amount is required for cash payments.'],
            ]);
        }

        if ($data['cash_paid'] < $data['total_price']) {
            throw ValidationException::withMessages([
                'cash_paid' => ['Cash paid must be equal to or greater than the total price.'],
            ]);
        }
    }

    public function process(array $data): array
    {
        return [
            'cash_paid' => $data['cash_paid'],
            'change' => round($data['cash_paid'] - $data['total_price'], 2),
        ];
    }
}
