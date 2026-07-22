<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository,
    ) {}

    public function list(array $filters = [], int $perPage = 15)
    {
        return $this->userRepository->all($filters, $perPage);
    }

    public function find(int $id)
    {
        return $this->userRepository->find($id);
    }

    public function create(array $data)
    {
        // Check email uniqueness
        if (User::where('email', $data['email'])->exists()) {
            throw ValidationException::withMessages([
                'email' => ['Email sudah digunakan oleh pengguna lain.'],
            ]);
        }

        $data['password'] = Hash::make($data['password']);

        return $this->userRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        $user = $this->userRepository->find($id);

        // Check email uniqueness (except current user)
        if (!empty($data['email']) && $data['email'] !== $user->email) {
            if (User::where('email', $data['email'])->where('id', '!=', $id)->exists()) {
                throw ValidationException::withMessages([
                    'email' => ['Email sudah digunakan oleh pengguna lain.'],
                ]);
            }
        }

        // Only hash password if provided
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        return $this->userRepository->update($id, $data);
    }

    public function delete(int $id)
    {
        return $this->userRepository->delete($id);
    }
}
