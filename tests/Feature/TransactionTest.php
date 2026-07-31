<?php

namespace Tests\Feature;

use App\Models\CancellationRequest;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_seeded_users_can_login(): void
    {
        $this->seed(\Database\Seeders\UserSeeder::class);

        $emails = [
            'admin@simplepos.com',
            'kasir1@simplepos.com',
            'kasir2@simplepos.com',
            'kasir3@simplepos.com',
            'kasir4@simplepos.com',
        ];

        foreach ($emails as $email) {
            $response = $this->postJson('/api/login', [
                'email' => $email,
                'password' => 'password',
            ]);

            $response->assertStatus(200)
                ->assertJsonStructure(['token', 'user']);
        }
    }

    public function test_checkout_kasir_rejects_product_from_another_warung(): void
    {
        $kasir = User::factory()->create([
            'role' => 'kasir',
            'warung_name' => 'Soto Warung 1',
        ]);

        $ownProduct = Product::create([
            'name' => 'Soto Ayam',
            'price' => 15000,
            'warung_name' => 'Soto Warung 1',
        ]);

        $otherProduct = Product::create([
            'name' => 'Jus Alpukat',
            'price' => 12000,
            'warung_name' => 'Jus Warung 3',
        ]);

        $response = $this->actingAs($kasir)->postJson('/api/transactions', [
            'payment_method' => 'cash',
            'cash_paid' => 30000,
            'items' => [
                ['product_id' => $ownProduct->id, 'qty' => 1],
                ['product_id' => $otherProduct->id, 'qty' => 1],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items']);
    }

    public function test_cancel_transaction_approval_deletes_transaction_and_details(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $kasir = User::factory()->create([
            'role' => 'kasir',
            'warung_name' => 'Soto Warung 1',
        ]);

        $product = Product::create([
            'name' => 'Soto Ayam',
            'price' => 15000,
            'warung_name' => 'Soto Warung 1',
        ]);

        $transaction = Transaction::create([
            'invoice_number' => 'INV-20260731-TEST',
            'user_id' => $kasir->id,
            'payment_method' => 'cash',
            'total_price' => 15000,
            'cash_paid' => 20000,
            'change' => 5000,
        ]);

        $detail = TransactionDetail::create([
            'transaction_id' => $transaction->id,
            'product_id' => $product->id,
            'qty' => 1,
            'price' => 15000,
            'subtotal' => 15000,
        ]);

        $cancellation = CancellationRequest::create([
            'user_id' => $kasir->id,
            'warung_name' => 'Soto Warung 1',
            'type' => 'cancel_transaction',
            'details' => 'INV-20260731-TEST',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($admin)
            ->postJson("/api/cancellation-requests/{$cancellation->id}/approve");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
        $this->assertDatabaseMissing('transaction_details', ['id' => $detail->id]);
        $this->assertDatabaseHas('cancellation_requests', [
            'id' => $cancellation->id,
            'status' => 'approved',
        ]);
    }

    public function test_approve_or_reject_non_pending_request_returns_422(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $cancellation = CancellationRequest::create([
            'user_id' => $admin->id,
            'warung_name' => 'Warung Test',
            'type' => 'clear_cart',
            'status' => 'approved',
        ]);

        $approveResponse = $this->actingAs($admin)
            ->postJson("/api/cancellation-requests/{$cancellation->id}/approve");

        $approveResponse->assertStatus(422)
            ->assertJson(['message' => 'Status request sudah berubah.']);

        $rejectResponse = $this->actingAs($admin)
            ->postJson("/api/cancellation-requests/{$cancellation->id}/reject");

        $rejectResponse->assertStatus(422)
            ->assertJson(['message' => 'Status request sudah berubah.']);
    }
}
