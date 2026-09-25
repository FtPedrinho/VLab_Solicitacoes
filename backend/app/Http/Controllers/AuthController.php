<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas.'], 401);
        }

        $plain = Str::random(64);
        ApiToken::create(['user_id' => $user->id, 'name' => 'api', 'token' => hash('sha256', $plain)]);

        return response()->json(['token' => $plain, 'token_type' => 'Bearer', 'user' => $user]);
    }

    public function register(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'max:100'],
            'role' => ['required', Rule::in(UserRole::values())],
        ]);

        $user = User::create($dados);
        $plain = Str::random(64);
        ApiToken::create(['user_id' => $user->id, 'name' => 'api', 'token' => hash('sha256', $plain)]);

        return response()->json(['token' => $plain, 'token_type' => 'Bearer', 'user' => $user], 201);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        $plain = $request->bearerToken();
        ApiToken::where('token', hash('sha256', (string) $plain))->delete();

        return response()->json(['message' => 'Sessão encerrada.']);
    }
}
