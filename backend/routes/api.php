<?php

use App\Http\Controllers\SolicitacaoController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/solicitacoes', [SolicitacaoController::class, 'index']);
    Route::post('/solicitacoes', [SolicitacaoController::class, 'store']);
    Route::get('/solicitacoes/{solicitacao}', [SolicitacaoController::class, 'show']);
    Route::patch('/solicitacoes/{solicitacao}/status', [SolicitacaoController::class, 'updateStatus']);
});
