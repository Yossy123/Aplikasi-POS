<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('user_id')->constrained('users');
            $table->enum('payment_method', ['cash', 'qris']);
            $table->decimal('total_price', 12, 2);
            $table->decimal('cash_paid', 12, 2)->nullable();
            $table->decimal('change', 12, 2)->nullable();
            $table->timestamps();

            $table->index('invoice_number');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
