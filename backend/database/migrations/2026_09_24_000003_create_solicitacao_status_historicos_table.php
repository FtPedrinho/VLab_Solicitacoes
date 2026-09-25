<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitacao_status_historicos', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('solicitacao_id')->constrained('solicitacoes')->cascadeOnDelete();
            $table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status_anterior');
            $table->string('status_novo');
            $table->timestamp('alterado_em');
            $table->index(['solicitacao_id', 'alterado_em']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitacao_status_historicos');
    }
};
