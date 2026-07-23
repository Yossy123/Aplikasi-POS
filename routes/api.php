<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Health check (public)
Route::get('/health-check', function () {
    return response()->json(['message' => 'Simple POS API is running']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth & OTP Verification
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/verify-supervisor-code', [AuthController::class, 'verifySupervisorCode']);

    // Products (read for all authenticated users)
    Route::get('/products', [ProductController::class, 'index']);

    // Products and Admin Transactions (write for admin, transaction logs for admin only)
    Route::middleware(EnsureUserIsAdmin::class)->group(function () {
        Route::get('/supervisor-code', [AuthController::class, 'getSupervisorCode']);
        Route::post('/supervisor-code/regenerate', [AuthController::class, 'regenerateSupervisorCode']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::get('/transactions/today-revenue', [TransactionController::class, 'todayRevenue']);
        Route::get('/transactions/daily-revenue', [TransactionController::class, 'dailyRevenue']);

        // User Management (Admin only)
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

    // My own transactions (Kasir)
    Route::get('/my-transactions', [TransactionController::class, 'myTransactions']);
});
