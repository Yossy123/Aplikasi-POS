<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'user' => new UserResource($this->whenLoaded('user')),
            'payment_method' => $this->payment_method->value,
            'total_price' => (float) $this->total_price,
            'cash_paid' => $this->cash_paid ? (float) $this->cash_paid : null,
            'change' => $this->change ? (float) $this->change : null,
            'details' => TransactionDetailResource::collection($this->whenLoaded('details')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
