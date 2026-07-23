<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService,
    ) {}

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login(
            $request->validated('email'),
            $request->validated('password'),
        );

        return response()->json([
            'message' => 'Login successful.',
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ]);
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function user(Request $request)
    {
        return new UserResource($request->user());
    }

    protected function getActiveWarungNames(): array
    {
        $kasirUsers = \App\Models\User::where('role', \App\Enums\UserRole::KASIR)->orderBy('id', 'asc')->get();
        $warungs = [];
        foreach ($kasirUsers as $u) {
            $name = $u->warung_name ?: ($u->name ?: 'Warung #' . $u->id);
            if (!in_array($name, $warungs)) {
                $warungs[] = $name;
            }
        }

        if (empty($warungs)) {
            $warungs = ['Warung 1', 'Warung 2', 'Warung 3', 'Warung 4'];
        }

        return $warungs;
    }

    public function getSupervisorCode(Request $request)
    {
        $warungNames = $this->getActiveWarungNames();
        $storedCodes = \Illuminate\Support\Facades\Cache::get('supervisor_otp_codes_map', []);

        $now = now()->timestamp;
        $updated = false;

        foreach ($warungNames as $wName) {
            if (!isset($storedCodes[$wName]) || $now >= $storedCodes[$wName]['expires_at']) {
                $storedCodes[$wName] = [
                    'code' => str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT),
                    'expires_at' => now()->addMinutes(3)->timestamp,
                ];
                $updated = true;
            }
        }

        if ($updated) {
            \Illuminate\Support\Facades\Cache::put('supervisor_otp_codes_map', $storedCodes, 180);
        }

        $list = [];
        foreach ($warungNames as $wName) {
            $item = $storedCodes[$wName] ?? null;
            if ($item) {
                $list[] = [
                    'warung_name' => $wName,
                    'code' => $item['code'],
                    'expires_in_seconds' => max(0, $item['expires_at'] - $now),
                ];
            }
        }

        return response()->json([
            'warungs' => $list,
        ]);
    }

    public function regenerateSupervisorCode(Request $request)
    {
        $targetWarung = $request->input('warung_name');
        $warungNames = $this->getActiveWarungNames();
        $storedCodes = \Illuminate\Support\Facades\Cache::get('supervisor_otp_codes_map', []);

        $now = now()->timestamp;
        $expiresAt = now()->addMinutes(3)->timestamp;

        foreach ($warungNames as $wName) {
            if (!$targetWarung || $targetWarung === $wName || !isset($storedCodes[$wName])) {
                $storedCodes[$wName] = [
                    'code' => str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT),
                    'expires_at' => $expiresAt,
                ];
            }
        }

        \Illuminate\Support\Facades\Cache::put('supervisor_otp_codes_map', $storedCodes, 180);

        $list = [];
        foreach ($warungNames as $wName) {
            $item = $storedCodes[$wName] ?? null;
            if ($item) {
                $list[] = [
                    'warung_name' => $wName,
                    'code' => $item['code'],
                    'expires_in_seconds' => max(0, $item['expires_at'] - $now),
                ];
            }
        }

        return response()->json([
            'warungs' => $list,
        ]);
    }

    public function verifySupervisorCode(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string'],
            'warung_name' => ['nullable', 'string'],
        ]);

        $cleanCode = trim($request->code);
        $user = $request->user();

        $userWarung = $user->warung_name ?: ($user->name ?: 'Warung #' . $user->id);
        $targetWarung = $request->input('warung_name', $userWarung);

        $storedCodes = \Illuminate\Support\Facades\Cache::get('supervisor_otp_codes_map', []);
        $now = now()->timestamp;

        $warungData = $storedCodes[$targetWarung] ?? null;

        if (!$warungData || $cleanCode !== $warungData['code']) {
            foreach ($storedCodes as $wName => $wData) {
                if ($wData['code'] === $cleanCode && $now < $wData['expires_at']) {
                    $targetWarung = $wName;
                    $warungData = $wData;
                    break;
                }
            }
        }

        if (!$warungData || $now >= $warungData['expires_at']) {
            return response()->json([
                'message' => "Kode OTP Supervisi untuk {$targetWarung} telah kedaluwarsa. Minta kode baru dari Admin.",
            ], 422);
        }

        if ($cleanCode !== $warungData['code']) {
            return response()->json([
                'message' => "Kode OTP Supervisi untuk {$targetWarung} tidak sesuai. Periksa 6 digit kode yang tampil di layar Admin.",
            ], 422);
        }

        // Regenerate ONLY this warung's OTP code for single-use security
        $storedCodes[$targetWarung] = [
            'code' => str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT),
            'expires_at' => now()->addMinutes(3)->timestamp,
        ];
        \Illuminate\Support\Facades\Cache::put('supervisor_otp_codes_map', $storedCodes, 180);

        return response()->json([
            'message' => "Persetujuan Kode OTP Supervisi untuk {$targetWarung} berhasil.",
            'warung_name' => $targetWarung,
        ]);
    }
}
