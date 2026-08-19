# CarBoard — Supabase Records Integration

> Especificação para o Codex conectar os fluxos de Registros do CarBoard ao Supabase remoto real.
>
> Antes de alterar código, leia:
> - `docs/ARCHITECTURE.md`
> - `docs/CarBoard-Codex-Context.md`
> - `docs/features/VEHICLE.md`
> - `docs/features/RECORDS.md`
> - `docs/features/SUPABASE.md`
>
> Pré-requisito: Auth funcionando, onboarding salvando veículo real, VehicleContext carregando veículo real e Meu Carro preferencialmente já migrado para dados reais.
>
> Objetivo: substituir os registros em memória por persistência real no Supabase, sem ainda implementar Home definitiva, Gastos completos, Histórico completo ou Storage.

## 1. Escopo

Conectar ao Supabase:

1. Registrar manutenção
2. Registrar abastecimento
3. Registrar problema
4. Registrar melhoria
5. Atualizar quilometragem

Os fluxos visuais já existem e devem ser preservados. Não redesenhar os formulários.

## 2. Banco — migrations

Se ainda não existirem, criar migration versionada para:

- `maintenance_records`
- `maintenance_items`
- `fuel_records`
- `problems`
- `improvements`
- `mileage_records`

Usar o schema definido em `SUPABASE.md`.

Aplicar PKs UUID, FKs, cascades apropriados, checks, índices úteis, RLS e policies.

## 3. RLS

Todas as tabelas devem ser protegidas por ownership do veículo.

Regra conceitual:

```sql
exists (
  select 1
  from public.vehicles v
  where v.id = <table>.vehicle_id
    and v.user_id = auth.uid()
)
```

Para `maintenance_items`, validar ownership via `maintenance_records`.

Criar políticas de SELECT/INSERT/UPDATE/DELETE conforme necessário.

Nunca confiar só no `vehicle_id` vindo do frontend.

## 4. Services

Criar/reutilizar:

```text
src/features/records/services/
├── maintenance.service.ts
├── fuel.service.ts
├── problem.service.ts
├── improvement.service.ts
└── mileage.service.ts
```

Páginas não devem conter queries Supabase longas diretamente.

## 5. Estado

Os registros não devem mais depender de memória como fonte principal.

Estado local/contexto pode continuar para:

- formulário;
- loading;
- cache temporário;
- optimistic UI controlada.

A fonte persistente passa a ser o Supabase.

## 6. Manutenção real

Fluxo:

```text
validar
→ criar maintenance_record
→ criar maintenance_items
→ atualizar vehicle_components
→ atualizar KM se maior
→ criar mileage_record quando aplicável
→ confirmar sucesso
→ Lottie maintenance
```

Salvar em `maintenance_records`:

- vehicle_id
- service_date
- mileage
- title
- total_cost
- workshop
- notes

Salvar em `maintenance_items` por componente selecionado.

Para óleo, usar `specification` JSON, por exemplo:

```json
{
  "viscosity": "5W-40",
  "type": "Sintético",
  "volumeLiters": 3.5
}
```

Atualizar em `vehicle_components`:

- last_service_date
- last_service_mileage
- interval_km se informado
- interval_months se informado

Evitar manutenção parcialmente salva. Preferir RPC transacional, por exemplo:

```text
create_maintenance_with_items(...)
```

## 7. Abastecimento real

Fluxo:

```text
validar
→ calcular terceiro valor se necessário
→ insert fuel_records
→ atualizar KM se maior
→ criar mileage_record
→ sucesso
→ Lottie refueling
```

Salvar:

- vehicle_id
- fueled_at
- mileage
- fuel_type
- total_cost
- liters
- price_per_liter
- full_tank
- station
- notes

Reutilizar:

```ts
calculateFuelValues()
calculateFuelEconomy()
```

Não criar consumo falso.

## 8. Problema real

Ao salvar:

```text
insert problems
status = open
→ atualizar KM se maior
→ mileage_record se aplicável
→ sucesso
→ success.json
```

Salvar:

- vehicle_id
- system_id nullable
- vehicle_component_id nullable
- title
- description
- detected_at
- mileage
- priority
- status = open
- estimated_cost

`estimated_cost` não é gasto real.

## 9. Melhoria real

Ao salvar:

```text
insert improvements
status = planned
→ sucesso
→ success.json
```

Salvar:

- vehicle_id
- title
- category
- priority
- status = planned
- estimated_budget
- product_name
- product_url
- notes

Não preencher `actual_cost` automaticamente.

`estimated_budget` não é gasto real.

## 10. Atualizar quilometragem

Ao confirmar:

```text
validar novo KM
→ se maior que atual
→ update vehicles.current_mileage
→ insert mileage_records
→ atualizar VehicleContext
→ sucesso
→ Lottie mileage
```

Nunca reduzir automaticamente.

Se menor:

- mostrar erro amigável;
- não atualizar;
- não criar mileage_record.

`source_type = manual`.

## 11. Helper central de KM

Criar função reutilizável:

```ts
updateVehicleMileageIfGreater({
  vehicleId,
  currentMileage,
  candidateMileage,
  sourceType,
  sourceId,
  recordedAt
})
```

Usar em:

- manutenção;
- abastecimento;
- problema;
- atualização manual.

## 12. Feedback Lottie

Regra obrigatória:

```text
Supabase confirma gravação
→ SuccessFeedback
→ Lottie
→ mensagem
```

Em erro:

- preservar formulário;
- permitir retry;
- não navegar;
- não mostrar sucesso.

## 13. Loading e submit

Todos os formulários devem:

- desabilitar botão durante submit;
- impedir submit duplo;
- mostrar loading discreto;
- evitar inserts duplicados.

## 14. Erros

Normalizar mensagens para algo amigável, por exemplo:

```text
Não foi possível registrar a manutenção. Tente novamente.
Não foi possível salvar o abastecimento.
Verifique sua conexão e tente novamente.
```

Não mostrar erro SQL/PostgREST cru.

## 15. Atualização da UI

Depois de salvar:

- refletir KM atualizado;
- atualizar VehicleContext;
- recarregar/invalidar dados relacionados;
- não depender de refresh manual.

Se Meu Carro já usa dados reais, componentes envolvidos devem refletir a nova manutenção imediatamente.

## 16. Tipos

Regenerar `database.types.ts` após migrations.

Preferir tipos gerados pelo schema e tipos de domínio derivados.

Evitar interfaces duplicadas divergentes.

## 17. Manutenção e status

Após manutenção real:

- componente recebe última data/KM;
- próxima manutenção usa dados reais;
- status pode ser recalculado.

Não persistir percentuais artificiais.

## 18. Consumo

`fuel_records` deve ficar pronto para cálculo real de consumo.

Nesta etapa, persistir corretamente e reutilizar helpers existentes.

Não criar dashboard.

## 19. Gastos futuros

Não criar tabela duplicada de gastos.

A futura tela Gastos deriva:

```text
maintenance_records.total_cost
fuel_records.total_cost
improvements.actual_cost
other_expenses.amount
```

Problema estimado não entra.

Melhoria planejada não entra.

## 20. Histórico futuro

Não criar tabela de histórico agora.

Os registros já devem conter dados suficientes para timeline posterior.

## 21. Mocks

Remover registros em memória como fonte principal.

Mocks podem ficar apenas para:

- desenvolvimento;
- testes isolados;
- fallback explícito.

Não mostrar registros fictícios quando usuário real estiver conectado.

## 22. Teste real — Manutenção

Registrar:

```text
Troca de óleo + filtro
12/08/2026
141.500 km
R$ 180
Oficina do João
Mobil Super 3000
5W-40
Sintético
3,5 L
```

Validar:

- 1 maintenance_record;
- 2 maintenance_items;
- vehicle_components atualizados;
- KM coerente;
- reload mantém tudo.

## 23. Teste real — Abastecimento

Registrar:

```text
12/08/2026
141.500 km
Gasolina
R$ 200
34,8 L
R$ 5,75/L
Tanque cheio
Posto Ipiranga
```

Validar:

- fuel_record persistido;
- reload mantém;
- KM coerente;
- Lottie só após confirmação.

## 24. Teste real — Problema

Registrar:

```text
Limpador traseiro não funciona
Elétrica
141.500 km
Prioridade média
R$ 150 estimado
```

Validar:

- status open;
- estimated_cost persistido;
- nenhum gasto real criado.

## 25. Teste real — Melhoria

Registrar:

```text
Alto-falantes das portas
Som e multimídia
Prioridade média
R$ 280 estimado
```

Validar:

- status planned;
- estimated_budget persistido;
- actual_cost null;
- nenhum gasto real criado.

## 26. Teste real — KM

Atualizar:

```text
141.500 → 142.350
```

Validar:

- vehicles.current_mileage = 142350;
- mileage_record criado;
- VehicleContext atualiza;
- reload mantém.

Tentar:

```text
142.350 → 140.000
```

Deve falhar amigavelmente.

## 27. Segurança

Testar usuário A/B:

- A não lê registros de B;
- A não cria registro em veículo de B;
- A não atualiza KM de B;
- A não altera maintenance_items de B.

Rodar Security Advisor após migrations.

## 28. Performance

Criar índices úteis para:

```text
vehicle_id
service_date
fueled_at
detected_at
created_at
status
```

Sem over-indexing.

## 29. Não implementar nesta etapa

Não implementar:

- Home definitiva;
- Gastos completos;
- Histórico completo;
- Storage;
- anexos reais;
- push;
- notificações;
- IA;
- OBD;
- OCR;
- edição/exclusão completas;
- social auth.

## 30. Ordem de execução

1. Ler documentação.
2. Inspecionar migrations atuais.
3. Criar migration das tabelas de registros.
4. Criar RLS/policies.
5. Criar índices.
6. Aplicar localmente.
7. Regenerar tipos.
8. Criar services.
9. Criar helper central de KM.
10. Conectar Manutenção.
11. Conectar Abastecimento.
12. Conectar Problema.
13. Conectar Melhoria.
14. Conectar Atualizar KM.
15. Remover dependência principal do store mock.
16. Testar persistência/reload.
17. Testar usuário A/B.
18. Rodar advisors.
19. `npm run lint`.
20. `npm run build`.
21. `git diff --check`.
22. Apresentar relatório.
23. PARAR.

## 31. Relatório esperado

### Banco

- migration criada;
- tabelas;
- constraints;
- índices;
- RLS;
- RPCs/functions.

### Frontend

- services;
- contexts;
- helpers;
- páginas alteradas;
- mocks removidos.

### Fluxos reais

Confirmar:

- manutenção;
- abastecimento;
- problema;
- melhoria;
- KM.

### Persistência

Confirmar que reload mantém os dados.

### Segurança

Resultado A/B e advisor.

### Validação

```text
npm run lint
npm run build
git diff --check
```

### Divergências

Qualquer decisão diferente deste documento.

Não avançar automaticamente para Home/Gastos/Histórico.

## Critério de aprovação

A etapa está pronta quando o usuário consegue:

```text
abrir app
→ registrar manutenção
→ fechar/reabrir
→ manutenção continua lá

registrar abastecimento
→ fechar/reabrir
→ abastecimento continua lá

registrar problema
→ continua em aberto após reload

registrar melhoria
→ continua planejada após reload

atualizar KM
→ KM permanece atualizado após reload
```

e nenhum desses fluxos depende de store mock como fonte persistente.

> Prioridade: fazer o CarBoard aceitar e preservar dados reais do usuário de ponta a ponta.
