# CarBoard — Supabase Integration v1

> Especificação para o Codex transformar o CarBoard de protótipo com mocks em aplicativo com dados reais.
>
> Antes de alterar código, leia:
> - `docs/ARCHITECTURE.md`
> - `docs/CarBoard-Codex-Conte.xt.md`
> - `docs/features/VEHICLE.md`
> - `docs/features/RECORDS.md`
>
> Objetivo desta etapa: implementar **Supabase + Auth + persistência real do veículo**, e depois conectar os registros, sem tentar finalizar toda a V1 em um único passo.

---

# 1. Princípio desta etapa

A partir daqui, os mocks deixam de ser a fonte principal de dados.

A primeira entrega real deve permitir:

```text
criar conta
→ fazer login
→ cadastrar um veículo
→ salvar no Supabase
→ fechar/reabrir o app
→ o veículo continua disponível
```

Depois disso, conectar:

```text
manutenção
abastecimento
problema
melhoria
quilometragem
```

ao banco real.

Não remover todos os mocks de uma vez. Migrar por domínio.

---

# 2. Stack

Usar:

- `@supabase/supabase-js`
- Supabase Auth
- PostgreSQL
- Row Level Security
- migrations versionadas
- tipos TypeScript gerados do schema quando possível

Storage fica para uma etapa posterior.

---

# 3. Variáveis de ambiente

Criar:

```text
.env.example
```

com:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Criar:

```text
src/services/supabase/client.ts
```

Regras:

- nunca versionar `.env`;
- nunca usar `service_role`/secret key no frontend;
- usar somente a chave pública/publishable do projeto;
- falhar de forma clara em desenvolvimento se as variáveis não existirem.

---

# 4. Migrations

Preferir migrations SQL versionadas.

Estrutura:

```text
supabase/
├── migrations/
└── seed.sql
```

Toda mudança estrutural relevante deve entrar em migration.

---

# 5. Auth

Implementar inicialmente:

- cadastro por email e senha;
- login por email e senha;
- logout;
- sessão persistente;
- restauração de sessão ao abrir o app;
- estado de loading enquanto a sessão é resolvida.

Não implementar Google/Apple nesta etapa.

Criar algo como:

```text
src/features/auth/
├── AuthContext.tsx
├── auth.service.ts
├── types.ts
└── components/
```

Evitar chamadas de Auth espalhadas pelas páginas.

---

# 6. Fluxo inicial

Regra:

```text
sem sessão
→ autenticação

com sessão, sem veículo
→ onboarding

com sessão e veículo
→ home
```

O onboarding existente deve passar a salvar o veículo real.

Não criar onboarding paralelo.

---

# 7. Tabela profiles

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
```

Pode usar trigger segura para criar o profile no signup.

---

# 8. Tabela vehicles

```sql
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text,
  brand text not null,
  model text not null,
  year integer not null,
  engine text,
  version text,
  plate text,
  current_mileage integer not null default 0 check (current_mileage >= 0),
  fuel_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

# 9. Catálogo de sistemas

```sql
create table public.system_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text,
  sort_order integer not null default 0
);
```

Seed inicial:

```text
motor
freios
suspensao
pneus
arrefecimento
eletrica
transmissao
iluminacao
```

---

# 10. Catálogo de componentes

```sql
create table public.component_catalog (
  id uuid primary key default gen_random_uuid(),
  system_id uuid not null references public.system_catalog(id) on delete cascade,
  slug text not null,
  name text not null,
  default_interval_km integer,
  default_interval_months integer
);
```

Seed mínimo do Motor:

```text
oleo-do-motor
filtro-de-oleo
filtro-de-ar
correia-dentada
velas
bomba-de-combustivel
```

Adicionar componentes básicos dos demais sistemas conforme os mocks já existentes.

---

# 11. Componentes do veículo

```sql
create table public.vehicle_components (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  catalog_component_id uuid references public.component_catalog(id),
  system_id uuid not null references public.system_catalog(id),
  custom_name text,
  status text not null default 'no_data'
    check (status in ('good','attention','critical','no_data')),
  interval_km integer,
  interval_months integer,
  last_service_date date,
  last_service_mileage integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Ao cadastrar veículo, criar componentes padrão por função/RPC ou rotina centralizada.

---

# 12. Manutenções

```sql
create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  service_date date not null,
  mileage integer not null check (mileage >= 0),
  title text not null,
  total_cost numeric(12,2),
  workshop text,
  notes text,
  created_at timestamptz not null default now()
);
```

```sql
create table public.maintenance_items (
  id uuid primary key default gen_random_uuid(),
  maintenance_id uuid not null references public.maintenance_records(id) on delete cascade,
  vehicle_component_id uuid references public.vehicle_components(id),
  description text,
  product_name text,
  brand text,
  specification jsonb,
  quantity numeric,
  item_cost numeric(12,2)
);
```

Exemplo de `specification`:

```json
{
  "viscosity": "5W-40",
  "type": "Sintético",
  "volumeLiters": 3.5
}
```

Salvar manutenção + itens de forma consistente. Se necessário, usar RPC/transação.

---

# 13. Abastecimentos

```sql
create table public.fuel_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  fueled_at date not null,
  mileage integer not null check (mileage >= 0),
  fuel_type text not null,
  total_cost numeric(12,2),
  liters numeric(10,3),
  price_per_liter numeric(10,3),
  full_tank boolean not null default false,
  station text,
  notes text,
  created_at timestamptz not null default now()
);
```

Reutilizar helpers existentes para cálculo de combustível.

---

# 14. Problemas

```sql
create table public.problems (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  system_id uuid references public.system_catalog(id),
  vehicle_component_id uuid references public.vehicle_components(id),
  title text not null,
  description text,
  detected_at date not null,
  mileage integer not null check (mileage >= 0),
  priority text not null default 'medium'
    check (priority in ('low','medium','high')),
  status text not null default 'open'
    check (status in ('open','monitoring','resolved')),
  estimated_cost numeric(12,2),
  resolved_at date,
  resolution_maintenance_id uuid references public.maintenance_records(id),
  created_at timestamptz not null default now()
);
```

Estimativa não entra em Gastos.

---

# 15. Melhorias

```sql
create table public.improvements (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  title text not null,
  category text,
  priority text not null default 'medium'
    check (priority in ('low','medium','high')),
  status text not null default 'planned'
    check (status in ('planned','purchased','installed')),
  estimated_budget numeric(12,2),
  actual_cost numeric(12,2),
  product_name text,
  product_url text,
  notes text,
  created_at timestamptz not null default now(),
  purchased_at date,
  installed_at date
);
```

Somente `actual_cost` é gasto real.

---

# 16. Histórico de quilometragem

```sql
create table public.mileage_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  mileage integer not null check (mileage >= 0),
  recorded_at date not null,
  source_type text not null,
  source_id uuid,
  created_at timestamptz not null default now()
);
```

Exemplos:

```text
manual
maintenance
fuel
problem
onboarding
```

Nunca reduzir `vehicles.current_mileage` automaticamente.

---

# 17. RLS

Ativar RLS nas tabelas de dados do usuário.

Regra conceitual:

```text
auth.uid() = vehicles.user_id
```

Para tabelas filhas, verificar propriedade pelo `vehicle_id`.

Exemplo:

```sql
exists (
  select 1
  from public.vehicles v
  where v.id = maintenance_records.vehicle_id
    and v.user_id = auth.uid()
)
```

Aplicar políticas de SELECT/INSERT/UPDATE/DELETE conforme necessário.

Catálogos globais podem ser read-only.

Nunca usar segurança apenas no frontend.

---

# 18. Serviços de dados

Criar services/repositories por domínio:

```text
src/features/vehicles/vehicle.service.ts
src/features/records/maintenance.service.ts
src/features/records/fuel.service.ts
src/features/records/problem.service.ts
src/features/records/improvement.service.ts
```

Páginas não devem conter queries grandes diretamente.

---

# 19. Veículo selecionado

Criar estado global simples para:

- sessão;
- veículo selecionado;
- loading inicial.

Arquitetura preparada para múltiplos veículos.

Se houver apenas um, selecionar automaticamente.

Não hardcodar `vehicle-1`.

---

# 20. Onboarding real

Ao finalizar onboarding:

1. inserir veículo;
2. registrar KM inicial;
3. criar componentes padrão;
4. aplicar check inicial quando possível;
5. atualizar contexto;
6. navegar para Home.

Depois disso, `mockVehicle` deixa de ser a fonte principal desse fluxo.

---

# 21. Migrar Meu Carro

Prioridade:

1. VehicleHeader real;
2. Informações reais;
3. Componentes reais;
4. Sistema real;
5. Detalhe de componente real.

Remover mocks gradualmente.

---

# 22. Migrar Registros

## Manutenção

Ao salvar:

- inserir `maintenance_records`;
- inserir `maintenance_items`;
- atualizar `last_service_date` e `last_service_mileage`;
- atualizar KM se maior;
- criar `mileage_record`.

## Abastecimento

- inserir `fuel_records`;
- atualizar KM se maior;
- criar `mileage_record`.

## Problema

- inserir `problems`;
- status inicial `open`;
- atualizar KM se maior.

## Melhoria

- inserir `improvements`;
- status inicial `planned`.

---

# 23. Status e saúde

Reutilizar funções de domínio existentes.

Princípio:

```text
sem dados → no_data
dentro do intervalo → good
próximo do intervalo → attention
passou do intervalo → critical
```

Thresholds devem ficar centralizados.

Não persistir percentuais por sistema.

---

# 24. Loading e erros

Toda operação deve ter:

- loading;
- erro amigável;
- retry quando útil;
- botão desabilitado durante submit;
- proteção contra submit duplo.

Nunca mostrar feedback Lottie antes da confirmação do Supabase.

---

# 25. Feedback de sucesso

Fluxo correto:

```text
submit
→ Supabase confirma
→ SuccessFeedback
→ Lottie
→ mensagem
```

Se houver erro, não mostrar sucesso.

---

# 26. Storage

Não implementar upload real nesta primeira entrega.

Manter botões de anexos visuais.

---

# 27. Tipos TypeScript

Configurar geração de tipos do banco.

Preferir tipos gerados pelo schema e wrappers/helpers de domínio.

Evitar manter duas fontes divergentes de verdade.

---

# 28. Seed

Criar `supabase/seed.sql` com:

- `system_catalog`;
- `component_catalog`.

Não colocar dados pessoais no seed de produção.

---

# 29. Primeira entrega Supabase

NÃO tentar conectar tudo de uma vez.

A primeira entrega deve ser somente:

```text
CADASTRO
↓
LOGIN
↓
ONBOARDING
↓
SALVAR VEÍCULO
↓
RELOAD
↓
VEÍCULO CONTINUA EXISTINDO
```

Também validar:

```text
LOGOUT
↓
LOGIN
↓
MESMO VEÍCULO APARECE
```

Somente depois disso conectar Registros.

---

# 30. Segunda entrega

Depois da aprovação:

```text
Manutenção real
Abastecimento real
Problema real
Melhoria real
Atualização de KM real
```

Persistência após reload obrigatória.

---

# 31. Terceira entrega

Depois:

```text
Meu Carro usando dados reais
Sistema real
Componente real
```

Nenhum dado principal deve depender de mocks.

---

# 32. Não implementar ainda

Não implementar nesta fase:

- Home definitiva;
- Gastos completos;
- Histórico completo;
- Storage;
- push;
- social auth;
- OBD;
- IA;
- busca por placa;
- OCR;
- pagamentos.

---

# 33. Validação

Executar:

```bash
npm run lint
npm run build
```

Validar também:

- usuário A não acessa veículo do usuário B;
- sessão sobrevive ao reload;
- logout limpa UI;
- novo usuário sem carro vai ao onboarding;
- usuário com carro vai à Home;
- KM não diminui automaticamente;
- erro de rede não gera sucesso falso.

---

# 34. Segurança

Nunca expor no app:

```text
service_role
secret key
```

Somente chave pública/publishable.

RLS é obrigatória.

---

# 35. Relatório esperado

Ao fim de cada entrega, informar:

## Banco
- migrations;
- tabelas;
- constraints;
- índices;
- RLS;
- seed.

## Frontend
- services;
- contexts;
- mocks removidos;
- telas conectadas.

## Auth
- cadastro;
- login;
- logout;
- persistência.

## Testes
- lint;
- build;
- testes manuais.

## Divergências
- qualquer decisão diferente desta especificação.

Não avançar automaticamente para a próxima entrega.

---

# 36. Ordem de execução — PRIMEIRA ENTREGA

1. Ler a documentação.
2. Inspecionar arquitetura atual.
3. Instalar `@supabase/supabase-js`.
4. Configurar `.env.example` e client.
5. Configurar migrations.
6. Criar `profiles`.
7. Criar `vehicles`.
8. Criar catálogos.
9. Criar `vehicle_components`.
10. Criar RLS.
11. Criar seed.
12. Implementar AuthContext.
13. Implementar cadastro/login/logout.
14. Criar proteção/redirecionamento de rotas.
15. Migrar onboarding para salvar veículo real.
16. Restaurar veículo após reload.
17. Remover mock como fonte principal do onboarding.
18. Executar lint/build.
19. Validar RLS.
20. Apresentar relatório.
21. PARAR.

---

# Critério de aprovação da primeira entrega

```text
Usuário cria conta
→ cadastra Projeto Gol
→ veículo é gravado no Supabase
→ recarrega o app
→ Projeto Gol continua aparecendo
→ logout
→ login
→ Projeto Gol continua aparecendo
```

sem depender de `mockVehicle`.

> Prioridade: transformar o CarBoard em um aplicativo com **sessão e persistência reais**, sem tentar finalizar todas as features ao mesmo tempo.
