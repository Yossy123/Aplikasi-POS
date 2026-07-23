<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            // Soto Warung 1
            ['name' => 'Soto Ayam',      'price' => 15000, 'stock' => 50, 'warung_name' => 'Soto Warung 1'],
            ['name' => 'Soto Daging',    'price' => 20000, 'stock' => 40, 'warung_name' => 'Soto Warung 1'],
            ['name' => 'Soto Babat',     'price' => 18000, 'stock' => 30, 'warung_name' => 'Soto Warung 1'],
            ['name' => 'Nasi Putih',     'price' => 5000,  'stock' => 100, 'warung_name' => 'Soto Warung 1'],
            ['name' => 'Es Teh Manis',   'price' => 5000,  'stock' => 100, 'warung_name' => 'Soto Warung 1'],
            ['name' => 'Teh Hangat',     'price' => 4000,  'stock' => 100, 'warung_name' => 'Soto Warung 1'],
            ['name' => 'Kerupuk',        'price' => 2000,  'stock' => 200, 'warung_name' => 'Soto Warung 1'],

            // Soto Warung 2
            ['name' => 'Soto Ayam',      'price' => 15000, 'stock' => 50, 'warung_name' => 'Soto Warung 2'],
            ['name' => 'Soto Daging',    'price' => 20000, 'stock' => 40, 'warung_name' => 'Soto Warung 2'],
            ['name' => 'Soto Babat',     'price' => 18000, 'stock' => 30, 'warung_name' => 'Soto Warung 2'],
            ['name' => 'Nasi Putih',     'price' => 5000,  'stock' => 100, 'warung_name' => 'Soto Warung 2'],
            ['name' => 'Es Jeruk',       'price' => 6000,  'stock' => 80, 'warung_name' => 'Soto Warung 2'],
            ['name' => 'Es Teh Manis',   'price' => 5000,  'stock' => 100, 'warung_name' => 'Soto Warung 2'],
            ['name' => 'Sate Telur',     'price' => 3000,  'stock' => 50, 'warung_name' => 'Soto Warung 2'],

            // Jus Warung 3
            ['name' => 'Jus Alpukat',    'price' => 12000, 'stock' => 30, 'warung_name' => 'Jus Warung 3'],
            ['name' => 'Jus Mangga',     'price' => 10000, 'stock' => 30, 'warung_name' => 'Jus Warung 3'],
            ['name' => 'Jus Jeruk',      'price' => 10000, 'stock' => 30, 'warung_name' => 'Jus Warung 3'],
            ['name' => 'Jus Strawberry', 'price' => 12000, 'stock' => 25, 'warung_name' => 'Jus Warung 3'],
            ['name' => 'Jus Melon',      'price' => 10000, 'stock' => 30, 'warung_name' => 'Jus Warung 3'],
            ['name' => 'Jus Wortel',     'price' => 10000, 'stock' => 25, 'warung_name' => 'Jus Warung 3'],
            ['name' => 'Es Campur',      'price' => 12000, 'stock' => 30, 'warung_name' => 'Jus Warung 3'],
            ['name' => 'Es Teler',       'price' => 13000, 'stock' => 25, 'warung_name' => 'Jus Warung 3'],

            // Seblak Warung 4
            ['name' => 'Seblak Original',    'price' => 12000, 'stock' => 40, 'warung_name' => 'Seblak Warung 4'],
            ['name' => 'Seblak Ceker',       'price' => 15000, 'stock' => 30, 'warung_name' => 'Seblak Warung 4'],
            ['name' => 'Seblak Tulang',      'price' => 15000, 'stock' => 30, 'warung_name' => 'Seblak Warung 4'],
            ['name' => 'Seblak Mie',         'price' => 13000, 'stock' => 35, 'warung_name' => 'Seblak Warung 4'],
            ['name' => 'Seblak Komplit',     'price' => 18000, 'stock' => 25, 'warung_name' => 'Seblak Warung 4'],
            ['name' => 'Es Teh Manis',       'price' => 5000,  'stock' => 100, 'warung_name' => 'Seblak Warung 4'],
            ['name' => 'Es Jeruk',           'price' => 6000,  'stock' => 80, 'warung_name' => 'Seblak Warung 4'],
        ];

        foreach ($menus as $menu) {
            Product::updateOrCreate(
                ['name' => $menu['name'], 'warung_name' => $menu['warung_name']],
                ['price' => $menu['price'], 'stock' => $menu['stock']]
            );
        }
    }
}
