<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CancellationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'warung_name',
        'type',
        'details',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
