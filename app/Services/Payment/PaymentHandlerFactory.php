<?php

namespace App\Services\Payment;

use App\Enums\PaymentMethod;
use InvalidArgumentException;

class PaymentHandlerFactory
{
    public function make(PaymentMethod $method): PaymentHandlerInterface
    {
        return match ($method) {
            PaymentMethod::CASH => new CashPaymentHandler(),
            PaymentMethod::QRIS => new QrisPaymentHandler(),
            default => throw new InvalidArgumentException("Unsupported payment method: {$method->value}"),
        };
    }
}
