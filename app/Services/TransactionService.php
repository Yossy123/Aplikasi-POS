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

        // Validate stock availability and calculate totals
        $lineItems = [];
        foreach ($items as $item) {
            $product = $products->get($item['product_id']);

            if (!$product) {
                throw ValidationException::withMessages([
                    'items' => ["Product with ID {$item['product_id']} not found."],
                ]);
            }

            if ($product->stock < $item['qty']) {
                throw ValidationException::withMessages([
                    'items' => ["Insufficient stock for {$product->name}. Available: {$product->stock}, Requested: {$item['qty']}."],
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

        // Execute transaction atomically
        return DB::transaction(function () use ($paymentMethod, $totalPrice, $paymentResult, $lineItems, $products, $items) {
            // Generate invoice number
            $invoiceNumber = $this->generateInvoiceNumber();

            // Create transaction
            $transaction = $this->transactionRepository->create([
                'invoice_number' => $invoiceNumber,
                'user_id' => auth()->id(),
                'payment_method' => $paymentMethod->value,
                'total_price' => $totalPrice,
                'cash_paid' => $paymentResult['cash_paid'],
                'change' => $paymentResult['change'],
            ]);

            // Create line items and decrement stock
            foreach ($lineItems as $lineItem) {
                TransactionDetail::create(array_merge($lineItem, [
                    'transaction_id' => $transaction->id,
                ]));

                $product = $products->get($lineItem['product_id']);
                $product->decrement('stock', $lineItem['qty']);
            }

            return $transaction->load(['user', 'details.product']);
        });
    }

    protected function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $prefix = "INV-{$date}-";

        $lastTransaction = \App\Models\Transaction::where('invoice_number', 'like', $prefix . '%')
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastTransaction) {
            $lastNumber = (int) substr($lastTransaction->invoice_number, -4);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
