<?php

namespace App\Services;

use App\Repositories\Contracts\ProductRepositoryInterface;

class ProductService
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository,
    ) {}

    public function list(array $filters = [], int $perPage = 15)
    {
        return $this->productRepository->all($filters, $perPage);
    }

    public function find(int $id)
    {
        return $this->productRepository->find($id);
    }

    public function create(array $data)
    {
        return $this->productRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->productRepository->update($id, $data);
    }

    public function delete(int $id)
    {
        return $this->productRepository->delete($id);
    }
}
