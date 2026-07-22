<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function all(array $filters = [], int $perPage = 15)
    {
        $query = User::query();

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function find(int $id)
    {
        return User::findOrFail($id);
    }

    public function create(array $data)
    {
        return User::create($data);
    }

    public function update(int $id, array $data)
    {
        $user = $this->find($id);
        $user->update($data);
        return $user;
    }

    public function delete(int $id)
    {
        $user = $this->find($id);

        // Prevent deleting self
        if ($user->id === auth()->id()) {
            abort(422, 'Tidak dapat menghapus akun Anda sendiri.');
        }

        // Prevent deleting the last admin
        if ($user->isAdmin() && User::where('role', 'admin')->count() <= 1) {
            abort(422, 'Tidak dapat menghapus admin terakhir.');
        }

        $user->delete();
        return $user;
    }
}
