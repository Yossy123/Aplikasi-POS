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
        $perPage = $request->integer('per_page', 15);

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
}
