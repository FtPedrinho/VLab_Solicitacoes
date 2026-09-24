<?php

namespace App\Http\Controllers;

use App\Enums\SolicitacaoCategoria;
use App\Enums\SolicitacaoPrioridade;
use App\Enums\SolicitacaoStatus;
use App\Http\Requests\StoreSolicitacaoRequest;
use App\Http\Requests\UpdateSolicitacaoStatusRequest;
use App\Models\Solicitacao;
use App\Services\SolicitacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

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

    public function summary(): JsonResponse
    {
        $counts = static function (string $column, array $values): array {
            $grouped = Solicitacao::query()
                ->selectRaw("{$column}, COUNT(*) as total")
                ->groupBy($column)
                ->pluck('total', $column);

            return collect($values)->mapWithKeys(
                fn (string $value): array => [$value => (int) ($grouped[$value] ?? 0)]
            )->all();
        };

        return response()->json([
            'total' => Solicitacao::query()->count(),
            'by_status' => $counts('status', SolicitacaoStatus::values()),
            'by_category' => $counts('categoria', SolicitacaoCategoria::values()),
            'by_priority' => $counts('prioridade', SolicitacaoPrioridade::values()),
        ]);
    }

    public function openapi(): Response
    {
        $path = (string) env('OPENAPI_PATH', base_path('../docs/openapi.yaml'));

        if (! is_file($path) || ! is_readable($path)) {
            abort(404, 'Especificação OpenAPI não encontrada.');
        }

        return response(
            file_get_contents($path),
            200,
            ['Content-Type' => 'application/yaml; charset=UTF-8']
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
