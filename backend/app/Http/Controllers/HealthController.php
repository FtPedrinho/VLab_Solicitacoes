<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $started = hrtime(true);
        $database = ['status' => 'ok'];

        try {
            DB::connection()->getPdo();
            DB::select('select 1');
            $database['latency_ms'] = round((hrtime(true) - $started) / 1_000_000, 2);
        } catch (Throwable $exception) {
            report($exception);
            $database = ['status' => 'failed', 'error' => 'database_unavailable'];
        }

        $healthy = $database['status'] === 'ok';

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'app' => ['status' => 'ok', 'environment' => app()->environment()],
            'database' => $database,
            'timestamp' => now()->toISOString(),
        ], $healthy ? 200 : 503);
    }
}
