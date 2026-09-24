<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('solicitacoes', function (Blueprint $table) {
            $table->id();
            $table->string('protocolo')->unique();
            $table->string('nome_solicitante');
            $table->string('categoria')->index();
            $table->string('prioridade')->index();
            $table->string('status')->default('RECEBIDA')->index();
            $table->text('descricao');
            $table->text('justificativa_prioridade')->nullable();
            $table->timestamp('data_criacao')->useCurrent();
            $table->timestamp('data_atualizacao')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitacoes');
    }
};
