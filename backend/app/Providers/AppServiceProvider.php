<?php

namespace App\Providers;

use App\Events\StatusAtualizado;
use App\Listeners\RegistrarHistoricoStatus;
use App\Models\Solicitacao;
use App\Policies\SolicitacaoPolicy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Solicitacao::class, SolicitacaoPolicy::class);
        Event::listen(StatusAtualizado::class, RegistrarHistoricoStatus::class);
    }
}
