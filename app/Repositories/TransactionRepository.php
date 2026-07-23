<?php

namespace App\Repositories;

use App\Models\Transaction;
use App\Repositories\Contracts\TransactionRepositoryInterface;

class TransactionRepository implements TransactionRepositoryInterface
{
    public function all(array $filters = [], int $perPage = 15)
    {
        $query = Transaction::with(['user', 'details.product']);

        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['search'])) {
            $query->where('invoice_number', 'like', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function find(int $id)
    {
        return Transaction::with(['user', 'details.product'])->findOrFail($id);
    }

    public function create(array $data)
    {
        return Transaction::create($data);
    }

    public function getTodayRevenue(): float
    {
        return (float) Transaction::whereDate('created_at', now()->toDateString())->sum('total_price');
    }

    public function getTodayRevenueByWarung(): array
    {
        $today = now()->toDateString();

        $userRevenues = Transaction::selectRaw('user_id, SUM(total_price) as revenue, COUNT(id) as tx_count')
            ->whereDate('created_at', $today)
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $users = \App\Models\User::where('role', 'kasir')->orderBy('id', 'asc')->get();

        $breakdown = [];
        foreach ($users as $user) {
            $userStat = $userRevenues->get($user->id);
            $warungName = $user->warung_name ?: ($user->name ?: 'Warung #' . $user->id);

            $breakdown[] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'warung_name' => $warungName,
                'revenue' => $userStat ? (float) $userStat->revenue : 0.0,
                'tx_count' => $userStat ? (int) $userStat->tx_count : 0,
            ];
        }

        return $breakdown;
    }

    public function getDailyRevenueHistory(int $days = 7): array
    {
        $startDate = now()->subDays($days - 1)->startOfDay();

        $results = Transaction::selectRaw("DATE(created_at) as date, SUM(total_price) as revenue, COUNT(id) as tx_count")
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $history = [];
        for ($i = 0; $i < $days; $i++) {
            $dateString = now()->subDays($days - 1 - $i)->toDateString();
            $history[$dateString] = [
                'revenue' => 0.0,
                'tx_count' => 0
            ];
        }

        foreach ($results as $row) {
            $history[$row->date] = [
                'revenue' => (float) $row->revenue,
                'tx_count' => (int) $row->tx_count
            ];
        }

        $formatted = [];
        foreach ($history as $date => $data) {
            $formatted[] = [
                'date' => $date,
                'revenue' => $data['revenue'],
                'tx_count' => $data['tx_count']
            ];
        }

        return $formatted;
    }

    public function allByUser(int $userId, array $filters = [], int $perPage = 15)
    {
        $query = Transaction::with(['user', 'details.product'])->where('user_id', $userId);

        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['search'])) {
            $query->where('invoice_number', 'like', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
