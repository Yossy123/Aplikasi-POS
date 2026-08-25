<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Models\Product;
use App\Models\TransactionDetail;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Services\Payment\PaymentHandlerFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    public function __construct(
        protected TransactionRepositoryInterface $transactionRepository,
        protected PaymentHandlerFactory $paymentHandlerFactory,
    ) {}

    public function list(array $filters = [], int $perPage = 15)
    {
        return $this->transactionRepository->all($filters, $perPage);
    }

    public function listMyTransactions(int $userId, array $filters = [], int $perPage = 15)
    {
        return $this->transactionRepository->allByUser($userId, $filters, $perPage);
    }

    public function find(int $id)
    {
        return $this->transactionRepository->find($id);
    }

    public function getTodayRevenue(): float
    {
        return $this->transactionRepository->getTodayRevenue();
    }

    public function getTodayRevenueByWarung(): array
    {
        return $this->transactionRepository->getTodayRevenueByWarung();
    }

    public function getDailyRevenueHistory(int $days = 7): array
    {
        return $this->transactionRepository->getDailyRevenueHistory($days);
    }

    public function create(array $data): \App\Models\Transaction
    {
        $paymentMethod = PaymentMethod::from($data['payment_method']);
        $items = $data['items'];

        // Calculate total from items
        $totalPrice = 0;
        $productIds = array_column($items, 'product_id');
        $products = Product::whereIn('id', $productIds)->lockForUpdate()->get()->keyBy('id');

        // Calculate totals and validate item existence & warung ownership
        $user = auth()->user();
        $userWarung = $user?->warung_name;
        $isKasir = $user && ($user->role === \App\Enums\UserRole::KASIR || $user->role === 'kasir' || (method_exists($user, 'isKasir') && $user->isKasir()));

        $lineItems = [];
        foreach ($items as $item) {
            $product = $products->get($item['product_id']);

            if (!$product) {
                throw ValidationException::withMessages([
                    'items' => ["Product with ID {$item['product_id']} not found."],
                ]);
            }

            if ($isKasir && !empty($userWarung) && $product->warung_name !== $userWarung) {
                throw ValidationException::withMessages([
                    'items' => ["Produk '{$product->name}' bukan milik warung {$userWarung}."],
                ]);
            }

            $subtotal = round($product->price * $item['qty'], 2);
            $totalPrice += $subtotal;

            $lineItems[] = [
                'product_id' => $product->id,
                'qty' => $item['qty'],
                'price' => $product->price,
                'subtotal' => $subtotal,
            ];
        }

        // Process payment
        $handler = $this->paymentHandlerFactory->make($paymentMethod);
        $paymentData = array_merge($data, ['total_price' => $totalPrice]);
        $handler->validate($paymentData);
        $paymentResult = $handler->process($paymentData);

        // Execute transaction atomically, retrying on rare invoice number collisions
        $maxAttempts = 3;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                return DB::transaction(function () use ($paymentMethod, $totalPrice, $paymentResult, $lineItems) {
                    // Create transaction
                    $transaction = $this->transactionRepository->create([
                        'invoice_number' => $this->generateInvoiceNumber(),
                        'user_id' => auth()->id(),
                        'payment_method' => $paymentMethod->value,
                        'total_price' => $totalPrice,
                        'cash_paid' => $paymentResult['cash_paid'],
                        'change' => $paymentResult['change'],
                    ]);

                    // Create line items
                    foreach ($lineItems as $lineItem) {
                        TransactionDetail::create(array_merge($lineItem, [
                            'transaction_id' => $transaction->id,
                        ]));
                    }

                    return $transaction->load(['user', 'details.product']);
                });
            } catch (\Illuminate\Database\QueryException $e) {
                $isDuplicateEntry = ($e->errorInfo[1] ?? null) == 1062
                    || str_contains($e->getMessage(), 'Duplicate entry');

                if (!$isDuplicateEntry || $attempt === $maxAttempts) {
                    throw $e;
                }
            }
        }

        throw new \RuntimeException('Failed to create transaction.');
    }

    protected function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $prefix = "INV-{$date}-";

        return $prefix . strtoupper(\Illuminate\Support\Str::random(4));
    }
}
