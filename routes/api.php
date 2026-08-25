<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CancellationRequestController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

// Public routes (throttled to prevent brute force)
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

// Health check (public)
Route::get('/health-check', function () {
    return response()->json(['message' => 'Simple POS API is running']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Products (read for all authenticated users)
    Route::get('/products', [ProductController::class, 'index']);

    // Admin Routes
    Route::middleware(EnsureUserIsAdmin::class)->group(function () {
        // Products management
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Transactions management
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::get('/transactions/today-revenue', [TransactionController::class, 'todayRevenue']);
        Route::get('/transactions/daily-revenue', [TransactionController::class, 'dailyRevenue']);

        // User Management (Admin only)
        Route::get('/warungs', [UserController::class, 'warungs']);
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    // Transactions (Checkout is accessible to all authenticated users)
    Route::post('/transactions', [TransactionController::class, 'store']);

    // Transaction detail (accessible by admin and owner)
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);

    // Cancel / Delete transaction (accessible by admin and owner)
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);

    // My own transactions (Kasir)
    Route::get('/my-transactions', [TransactionController::class, 'myTransactions']);

    // Cancellation requests
    Route::get('/cancellation-requests', [CancellationRequestController::class, 'index'])
        ->middleware(EnsureUserIsAdmin::class);
    Route::post('/cancellation-requests', [CancellationRequestController::class, 'store']);
    Route::get('/cancellation-requests/{id}', [CancellationRequestController::class, 'show']);

    Route::middleware(EnsureUserIsAdmin::class)->group(function () {
        Route::post('/cancellation-requests/{id}/approve', [CancellationRequestController::class, 'approve']);
        Route::post('/cancellation-requests/{id}/reject', [CancellationRequestController::class, 'reject']);
    });
});
