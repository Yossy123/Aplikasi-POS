<?php

namespace App\Services\Payment;

interface PaymentHandlerInterface
{
    public function validate(array $data): void;
    public function process(array $data): array;
}
