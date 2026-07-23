<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService,
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['search']);
        $perPage = $request->integer('per_page', 20);

        // Auto-filter by warung_name for kasir users
        $user = $request->user();
        if ($user && $user->role->value === 'kasir' && $user->warung_name) {
            $filters['warung_name'] = $user->warung_name;
        } elseif ($request->filled('warung_name')) {
            // Admin can filter by warung_name via query param
            $filters['warung_name'] = $request->input('warung_name');
        }

        $products = $this->productService->list($filters, $perPage);

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request)
    {
        $product = $this->productService->create($request->validated());

        return (new ProductResource($product))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateProductRequest $request, int $id)
    {
        $product = $this->productService->update($id, $request->validated());

        return new ProductResource($product);
    }

    public function destroy(int $id)
    {
        $this->productService->delete($id);

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }
}
