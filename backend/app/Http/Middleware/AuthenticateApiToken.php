<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $plain = $request->bearerToken();
        $token = $plain ? ApiToken::with('user')->where('token', hash('sha256', $plain))->first() : null;

        if (! $token || ($token->expires_at && $token->expires_at->isPast())) {
            return response()->json(['message' => 'Autenticação necessária.'], 401);
        }

        $token->forceFill(['last_used_at' => now()])->save();
        auth()->setUser($token->user);

        return $next($request);
    }
}
