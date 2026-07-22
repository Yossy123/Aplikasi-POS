<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Nasi Goreng', 'price' => 25000, 'stock' => 50],
            ['name' => 'Mie Goreng', 'price' => 22000, 'stock' => 50],
            ['name' => 'Ayam Bakar', 'price' => 35000, 'stock' => 30],
            ['name' => 'Ayam Geprek', 'price' => 28000, 'stock' => 40],
            ['name' => 'Sate Ayam (10 tusuk)', 'price' => 30000, 'stock' => 25],
            ['name' => 'Es Teh Manis', 'price' => 5000, 'stock' => 100],
            ['name' => 'Es Jeruk', 'price' => 8000, 'stock' => 80],
            ['name' => 'Kopi Hitam', 'price' => 7000, 'stock' => 60],
            ['name' => 'Air Mineral', 'price' => 4000, 'stock' => 120],
            ['name' => 'Jus Alpukat', 'price' => 15000, 'stock' => 35],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
