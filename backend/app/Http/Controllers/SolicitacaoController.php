<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSolicitacaoRequest;
use App\Http\Requests\UpdateSolicitacaoStatusRequest;
use App\Models\Solicitacao;
use App\Services\SolicitacaoService;
use Illuminate\Http\Request;

class SolicitacaoController extends Controller
{
    public function __construct(
        protected readonly SolicitacaoService $solicitacaoService,
    ) {}

    public function index(Request $request)
    {
        $query = Solicitacao::query();

        foreach (['status', 'categoria', 'prioridade'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->input($field));
            }
        }

        return response()->json(
            $query->orderBy('data_criacao', 'desc')->paginate($request->integer('per_page', 15))
        );
    }

    public function store(StoreSolicitacaoRequest $request)
    {
        $solicitacao = $this->solicitacaoService->criar($request->validated());

        return response()->json($solicitacao, 201);
    }

    public function show(Solicitacao $solicitacao)
    {
        return response()->json($solicitacao);
    }

    public function updateStatus(Solicitacao $solicitacao, UpdateSolicitacaoStatusRequest $request)
    {
        $solicitacao = $this->solicitacaoService->atualizarStatus(
            $solicitacao,
            $request->validated('status')
        );

        return response()->json($solicitacao);
    }
}
