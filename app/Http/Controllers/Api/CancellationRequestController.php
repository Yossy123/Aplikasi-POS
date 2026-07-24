<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CancellationRequest;
use Illuminate\Http\Request;

class CancellationRequestController extends Controller
{
    /**
     * Create a new cancellation request (Kasir)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:clear_cart,remove_item,cancel_checkout,cancel_transaction'],
            'details' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $warungName = $user->warung_name ?: ($user->name ?: 'Warung #' . $user->id);

        $cancellation = CancellationRequest::create([
            'user_id' => $user->id,
            'warung_name' => $warungName,
            'type' => $validated['type'],
            'details' => $validated['details'] ?? null,
            'status' => 'pending',
        ]);

        $cancellation->load('user:id,name,warung_name');

        // Send email notification to all Admin users
        try {
            $adminEmails = \App\Models\User::where('role', \App\Enums\UserRole::ADMIN->value)
                ->pluck('email')
                ->filter()
                ->toArray();

            $mailUser = config('mail.from.address') ?: env('MAIL_USERNAME');
            if ($mailUser && !in_array($mailUser, $adminEmails)) {
                $adminEmails[] = $mailUser;
            }

            if (!empty($adminEmails)) {
                \Illuminate\Support\Facades\Mail::to($adminEmails)
                    ->send(new \App\Mail\CancellationRequestedMail($cancellation));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Gagal mengirim email notifikasi pembatalan: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Permintaan pembatalan diajukan, menunggu persetujuan Admin.',
            'data' => $cancellation,
        ], 201);
    }

    /**
     * List all pending cancellation requests (Admin)
     */
    public function index(Request $request)
    {
        $requests = CancellationRequest::with('user:id,name,warung_name')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $requests,
        ]);
    }

    /**
     * Get specific cancellation request status (Kasir / Admin)
     */
    public function show($id)
    {
        $cancellation = CancellationRequest::with('user:id,name,warung_name')->findOrFail($id);

        $user = auth()->user();
        if (!$user->isAdmin() && $cancellation->user_id !== $user->id) {
            abort(403, 'Forbidden.');
        }

        return response()->json([
            'data' => $cancellation,
        ]);
    }

    /**
     * Approve cancellation request (Admin)
     */
    public function approve($id)
    {
        $cancellation = CancellationRequest::findOrFail($id);
        $cancellation->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Permintaan pembatalan disetujui.',
            'data' => $cancellation->fresh(['user:id,name,warung_name']),
        ]);
    }

    /**
     * Reject cancellation request (Admin)
     */
    public function reject($id)
    {
        $cancellation = CancellationRequest::findOrFail($id);
        $cancellation->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Permintaan pembatalan ditolak.',
            'data' => $cancellation->fresh(['user:id,name,warung_name']),
        ]);
    }
}
