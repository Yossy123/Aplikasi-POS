<?php

namespace App\Providers;

use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\ProductRepository;
use App\Repositories\TransactionRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);
        $this->app->bind(TransactionRepositoryInterface::class, TransactionRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
