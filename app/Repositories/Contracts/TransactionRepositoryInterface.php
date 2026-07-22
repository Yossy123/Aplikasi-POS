<?php

namespace App\Repositories\Contracts;

interface TransactionRepositoryInterface
{
    public function all(array $filters = [], int $perPage = 15);
    public function find(int $id);
    public function create(array $data);
    public function getTodayRevenue(): float;
    public function getDailyRevenueHistory(int $days = 7): array;
    public function allByUser(int $userId, array $filters = [], int $perPage = 15);
}
