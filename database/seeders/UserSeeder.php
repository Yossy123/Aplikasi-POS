<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@simplepos.com'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('password'),
                'role' => UserRole::ADMIN,
                'warung_name' => null,
            ]
        );

        $warungs = [
            ['name' => 'Kasir Soto 1', 'email' => 'kasir1@simplepos.com', 'warung' => 'Soto Warung 1'],
            ['name' => 'Kasir Soto 2', 'email' => 'kasir2@simplepos.com', 'warung' => 'Soto Warung 2'],
            ['name' => 'Kasir Jus',    'email' => 'kasir3@simplepos.com', 'warung' => 'Jus Warung 3'],
            ['name' => 'Kasir Seblak', 'email' => 'kasir4@simplepos.com', 'warung' => 'Seblak Warung 4'],
        ];

        foreach ($warungs as $w) {
            User::updateOrCreate(
                ['email' => $w['email']],
                [
                    'name' => $w['name'],
                    'password' => bcrypt('password'),
                    'role' => UserRole::KASIR,
                    'warung_name' => $w['warung'],
                ]
            );
        }
    }
}
