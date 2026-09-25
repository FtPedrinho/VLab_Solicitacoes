<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestCorrelation
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->attributes->set('request_id', $request->header('X-Request-ID') ?: (string) Str::uuid());
        $started = hrtime(true);

        try {
            $response = $next($request);
        } finally {
            $duration = round((hrtime(true) - $started) / 1_000_000, 2);
            Log::info('http.request', [
                'request_id' => $request->attributes->get('request_id'),
                'method' => $request->method(),
                'path' => $request->path(),
                'status' => isset($response) ? $response->getStatusCode() : 500,
                'duration_ms' => $duration,
                'user_id' => $request->user()?->getAuthIdentifier(),
            ]);
        }

        return $response->header('X-Request-ID', $request->attributes->get('request_id'));
    }
}
