<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService,
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'role']);
        $perPage = min($request->integer('per_page', 15), 100);

        $users = $this->userService->list($filters, $perPage);

        return UserResource::collection($users);
    }

    public function show(int $id)
    {
        $user = $this->userService->find($id);

        return new UserResource($user);
    }

    public function store(StoreUserRequest $request)
    {
        $user = $this->userService->create($request->validated());

        return (new UserResource($user))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateUserRequest $request, int $id)
    {
        $user = $this->userService->update($id, $request->validated());

        return new UserResource($user);
    }

    public function destroy(int $id)
    {
        $this->userService->delete($id);

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    public function warungs()
    {
        $userWarungs = \App\Models\User::where('role', 'kasir')
            ->whereNotNull('warung_name')
            ->where('warung_name', '!=', '')
            ->pluck('warung_name');

        $productWarungs = \App\Models\Product::whereNotNull('warung_name')
            ->where('warung_name', '!=', '')
            ->pluck('warung_name');

        $warungs = $userWarungs->concat($productWarungs)
            ->unique()
            ->values();

        return response()->json([
            'data' => $warungs,
        ]);
    }
}
