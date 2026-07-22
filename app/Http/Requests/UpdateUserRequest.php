<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'password' => ['sometimes', 'string', 'min:6', 'nullable'],
            'role' => ['sometimes', Rule::enum(UserRole::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'Nama tidak valid.',
            'email.email' => 'Email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.min' => 'Password minimal 6 karakter.',
        ];
    }
}
