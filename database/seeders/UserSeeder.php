<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@simplepos.com',
            'password' => bcrypt('password'),
            'role' => UserRole::ADMIN,
        ]);

        User::create([
            'name' => 'Kasir Demo',
            'email' => 'kasir@simplepos.com',
            'password' => bcrypt('password'),
            'role' => UserRole::KASIR,
        ]);
    }
}
