<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Services\TransactionService;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(
        protected TransactionService $transactionService,
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['payment_method', 'date_from', 'date_to', 'search']);
        $perPage = $request->integer('per_page', 15);

        $transactions = $this->transactionService->list($filters, $perPage);

        return TransactionResource::collection($transactions);
    }

    public function myTransactions(Request $request)
    {
        $filters = $request->only(['payment_method', 'date_from', 'date_to', 'search']);
        $perPage = $request->integer('per_page', 15);

        $transactions = $this->transactionService->listMyTransactions(
            auth()->id(),
            $filters,
            $perPage
        );

        return TransactionResource::collection($transactions);
    }

    public function store(StoreTransactionRequest $request)
    {
        $transaction = $this->transactionService->create($request->validated());

        return (new TransactionResource($transaction))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id)
    {
        $transaction = $this->transactionService->find($id);

        // Kasir can only view their own transactions
        if (!auth()->user()->isAdmin() && $transaction->user_id !== auth()->id()) {
            abort(403, 'Forbidden.');
        }

        return new TransactionResource($transaction);
    }

    public function todayRevenue()
    {
        $revenue = $this->transactionService->getTodayRevenue();
        $byWarung = $this->transactionService->getTodayRevenueByWarung();

        return response()->json([
            'data' => [
                'today_revenue' => $revenue,
                'by_warung' => $byWarung,
            ]
        ]);
    }

    public function dailyRevenue(Request $request)
    {
        $days = $request->integer('days', 7);
        if ($days <= 0 || $days > 90) {
            $days = 7;
        }

        $history = $this->transactionService->getDailyRevenueHistory($days);

        return response()->json([
            'data' => $history
        ]);
    }
}
