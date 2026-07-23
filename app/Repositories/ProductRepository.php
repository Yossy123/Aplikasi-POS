<?php

namespace App\Repositories;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;

class ProductRepository implements ProductRepositoryInterface
{
    public function all(array $filters = [], int $perPage = 15)
    {
        $query = Product::query();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['warung_name'])) {
            $query->where('warung_name', $filters['warung_name']);
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    public function find(int $id)
    {
        return Product::findOrFail($id);
    }

    public function create(array $data)
    {
        return Product::create($data);
    }

    public function update(int $id, array $data)
    {
        $product = $this->find($id);
        $product->update($data);
        return $product;
    }

    public function delete(int $id)
    {
        $product = $this->find($id);
        $product->delete();
        return $product;
    }
}
