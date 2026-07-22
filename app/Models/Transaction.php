<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'user_id',
        'payment_method',
        'total_price',
        'cash_paid',
        'change',
    ];

    protected function casts(): array
    {
        return [
            'payment_method' => PaymentMethod::class,
            'total_price' => 'decimal:2',
            'cash_paid' => 'decimal:2',
            'change' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function details()
    {
        return $this->hasMany(TransactionDetail::class);
    }
}
