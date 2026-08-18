# CarBoard --- Arquitetura Técnica v1

> Documento-base para implementação do MVP do CarBoard.\
> Status: **Design v1 fechado / arquitetura inicial para
> desenvolvimento**

## 1. Visão do produto

O **CarBoard** é um aplicativo mobile para centralizar o acompanhamento
do veículo pelo proprietário. A proposta é funcionar como um "Apple
Health para o carro": uma interface limpa e acessível que reúne
manutenção, componentes, abastecimentos, consumo, problemas, melhorias,
gastos e histórico.

### Pilares

-   **Cuidar:** sistemas, componentes, manutenções e problemas.
-   **Usar:** quilometragem, abastecimentos e consumo.
-   **Planejar:** próximas manutenções e melhorias.
-   **Entender:** gastos e histórico do veículo.

### MVP v1

-   onboarding e cadastro manual;
-   múltiplos veículos previstos na arquitetura;
-   Home e Meu Carro;
-   sistemas e componentes;
-   detalhe de sistema/componente;
-   manutenção, abastecimento, problemas e melhorias;
-   gastos;
-   histórico;
-   atualização de quilometragem;
-   anexos básicos.

### Fora do MVP inicial

Busca automática pela placa, diagnóstico por IA, OBD/telemetria,
oficinas próximas, reconhecimento de comprovantes, integrações externas
e notificações avançadas.

## 2. Stack

-   **React + TypeScript**
-   **Ionic React + Capacitor**
-   **Supabase**
-   PostgreSQL
-   Supabase Auth
-   Supabase Storage
-   CSS Variables / Ionic theming
-   uma única biblioteca de ícones, preferencialmente Lucide
-   Lottie para animações ilustrativas

Princípio: adicionar dependências somente quando resolverem uma
necessidade real.

## 3. Navegação

Bottom navigation oficial:

**Início \| Meu Carro \| + \| Gastos \| Histórico**

O `+` abre um bottom sheet.

### Rotas

``` text
/onboarding
/onboarding/vehicle
/onboarding/mileage
/onboarding/initial-check
/onboarding/complete
/home
/vehicle
/vehicle/components
/vehicle/info
/vehicle/system/:systemId
/vehicle/component/:componentId
/register/maintenance
/register/fuel
/register/problem
/register/improvement
/expenses
/history
```

Confirmações, sucesso, atualização rápida de KM e seleções simples devem
preferir modal/bottom sheet em vez de novas páginas.

## 4. Estrutura do projeto

``` text
src/
├── components/
│   ├── layout/
│   ├── ui/
│   ├── forms/
│   └── vehicle/
├── features/
│   ├── vehicles/
│   ├── components/
│   ├── maintenance/
│   ├── fuel/
│   ├── problems/
│   ├── improvements/
│   ├── expenses/
│   └── history/
├── pages/
├── hooks/
├── services/
│   ├── supabase/
│   └── storage/
├── types/
├── utils/
├── theme/
└── assets/
```

## 5. Componentes reutilizáveis

**Layout:** `AppHeader`, `BottomNavigation`, `PageContainer`,
`FocusedFormHeader`, `VehicleHeader`.

**UI:** `Card`, `PrimaryButton`, `SecondaryButton`, `StatusLabel`,
`FilterChip`, `SegmentedControl`, `EmptyState`, `QuickActionSheet`.

**Forms:** `FormField`, `SelectField`, `DateField`, `MileageField`,
`CurrencyField`, `TextareaField`, `AttachmentButton`.

**Veículo:** `VehicleHealthCard`, `SystemRow`, `ComponentRow`,
`MaintenanceForecast`, `AttentionItem`, `HistoryRow`.

Não criar versões independentes para cada página sem necessidade.

## 6. Design System

As medidas e cores exatas serão extraídas do Figma.

``` css
:root {
  --cb-primary: /* azul oficial do Figma */;
  --cb-background: /* off-white oficial */;
  --cb-surface: #fff;

  --cb-attention: /* laranja */;
  --cb-critical: /* vermelho */;
  --cb-upgrade: /* roxo */;
  --cb-success: /* verde */;
  --cb-muted: /* cinza */;

  --cb-radius-sm: 8px;
  --cb-radius-md: 12px;
  --cb-radius-lg: 16px;

  --cb-space-xs: 4px;
  --cb-space-sm: 8px;
  --cb-space-md: 16px;
  --cb-space-lg: 24px;
  --cb-space-xl: 32px;
}
```

Status: Bom = azul; Atenção = laranja; Crítico = vermelho; Sem dados =
cinza; Melhoria = roxo quando necessário.

Percentual somente na saúde geral, nunca em cada sistema.

## 7. Modelo de dados

### `profiles`

-   `id uuid PK/FK auth.users`
-   `display_name text nullable`
-   `created_at timestamptz`

### `vehicles`

-   `id uuid PK`
-   `user_id uuid FK`
-   `nickname text nullable`
-   `brand text`
-   `model text`
-   `year integer`
-   `engine text nullable`
-   `version text nullable`
-   `plate text nullable`
-   `current_mileage integer`
-   `fuel_type text nullable`
-   `created_at timestamptz`
-   `updated_at timestamptz`

### `system_catalog`

Catálogo global: Motor, Freios, Suspensão, Pneus, Arrefecimento,
Elétrica etc.

-   `id uuid PK`
-   `slug text unique`
-   `name text`
-   `icon text nullable`
-   `sort_order integer`

### `component_catalog`

-   `id uuid PK`
-   `system_id uuid FK`
-   `slug text`
-   `name text`
-   `default_interval_km integer nullable`
-   `default_interval_months integer nullable`

### `vehicle_components`

-   `id uuid PK`
-   `vehicle_id uuid FK`
-   `catalog_component_id uuid nullable FK`
-   `system_id uuid FK`
-   `custom_name text nullable`
-   `status text`
-   `interval_km integer nullable`
-   `interval_months integer nullable`
-   `last_service_date date nullable`
-   `last_service_mileage integer nullable`
-   `notes text nullable`
-   timestamps

### `maintenance_records`

-   `id uuid PK`
-   `vehicle_id uuid FK`
-   `service_date date`
-   `mileage integer`
-   `title text`
-   `service_type text nullable`
-   `total_cost numeric nullable`
-   `workshop text nullable`
-   `notes text nullable`
-   `created_at timestamptz`

### `maintenance_items`

Permite uma manutenção envolver vários componentes.

-   `id uuid PK`
-   `maintenance_id uuid FK`
-   `vehicle_component_id uuid nullable FK`
-   `description text nullable`
-   `product_name text nullable`
-   `brand text nullable`
-   `specification jsonb nullable`
-   `quantity numeric nullable`
-   `item_cost numeric nullable`

Exemplo de `specification`:

``` json
{
  "viscosity": "5W-40",
  "type": "Sintético",
  "volume_liters": 3.5
}
```

### `fuel_records`

-   `id uuid PK`
-   `vehicle_id uuid FK`
-   `fueled_at date`
-   `mileage integer`
-   `fuel_type text`
-   `total_cost numeric nullable`
-   `liters numeric nullable`
-   `price_per_liter numeric nullable`
-   `full_tank boolean`
-   `station text nullable`
-   `notes text nullable`
-   `created_at timestamptz`

### `problems`

-   `id uuid PK`
-   `vehicle_id uuid FK`
-   `vehicle_component_id uuid nullable FK`
-   `system_id uuid nullable FK`
-   `title text`
-   `description text nullable`
-   `detected_at date`
-   `mileage integer`
-   `priority text`
-   `status text`
-   `estimated_cost numeric nullable`
-   `resolved_at date nullable`
-   `resolution_maintenance_id uuid nullable FK`
-   `created_at timestamptz`

Status: `open`, `monitoring`, `resolved`.

### `improvements`

-   `id uuid PK`
-   `vehicle_id uuid FK`
-   `title text`
-   `category text nullable`
-   `priority text`
-   `status text`
-   `estimated_budget numeric nullable`
-   `actual_cost numeric nullable`
-   `product_name text nullable`
-   `product_url text nullable`
-   `notes text nullable`
-   `created_at timestamptz`
-   `purchased_at date nullable`
-   `installed_at date nullable`

Status: `planned`, `purchased`, `installed`.

### `other_expenses`

Somente gastos não derivados dos registros acima.

-   `id uuid PK`
-   `vehicle_id uuid FK`
-   `expense_date date`
-   `category text`
-   `description text`
-   `amount numeric`
-   `mileage integer nullable`
-   `notes text nullable`
-   `created_at timestamptz`

### `attachments`

-   `id uuid PK`
-   `vehicle_id uuid FK`
-   `entity_type text`
-   `entity_id uuid`
-   `storage_path text`
-   `file_type text nullable`
-   `created_at timestamptz`

### `mileage_records`

-   `id uuid PK`
-   `vehicle_id uuid FK`
-   `mileage integer`
-   `recorded_at date`
-   `source_type text`
-   `source_id uuid nullable`
-   `created_at timestamptz`

## 8. Gastos sem duplicação

A tela Gastos agrega:

``` text
fuel_records.total_cost
+ maintenance_records.total_cost
+ improvements.actual_cost
+ other_expenses.amount
```

Logo, abastecimentos e manutenções entram automaticamente. Orçamento
planejado não entra. `other_expenses` é usado para lavagem,
estacionamento, pedágio, seguro, documentos etc.

## 9. Histórico unificado

Na v1 não é necessário criar tabela própria. O frontend pode combinar os
registros dos vários domínios.

``` ts
type HistoryEventType =
  | 'fuel'
  | 'maintenance'
  | 'problem'
  | 'improvement'
  | 'expense';

interface HistoryEvent {
  id: string;
  vehicleId: string;
  type: HistoryEventType;
  date: string;
  mileage?: number;
  title: string;
  subtitle?: string;
  amount?: number;
  status?: string;
}
```

## 10. Tipos TypeScript iniciais

``` ts
export interface Vehicle {
  id: string;
  userId: string;
  nickname?: string;
  brand: string;
  model: string;
  year: number;
  engine?: string;
  version?: string;
  plate?: string;
  currentMileage: number;
}

export type ComponentStatus =
  | 'good'
  | 'attention'
  | 'critical'
  | 'no_data';

export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  fuelType: string;
  totalCost?: number;
  liters?: number;
  pricePerLiter?: number;
  fullTank: boolean;
  station?: string;
}

export type ProblemPriority = 'low' | 'medium' | 'high';
export type ProblemStatus = 'open' | 'monitoring' | 'resolved';
export type ImprovementStatus = 'planned' | 'purchased' | 'installed';
```

Quando o Supabase estiver criado, preferir os tipos gerados
automaticamente pelo banco.

## 11. Regras de negócio

### Quilometragem

-   Nunca reduzir automaticamente a quilometragem atual.
-   Registro com KM maior pode oferecer atualização do hodômetro.
-   Registro histórico com KM menor é permitido.
-   Alterações relevantes podem gerar `mileage_records`.

### Manutenção

``` text
nextMileage = lastServiceMileage + intervalKm
nextDate = lastServiceDate + intervalMonths
```

Se ambos existirem, a manutenção vence quando qualquer limite aplicável
for atingido.

### Status de componente

-   `no_data`: dados insuficientes;
-   `good`: dentro do intervalo;
-   `attention`: próximo do limite;
-   `critical`: limite ultrapassado ou condição crítica explicitamente
    registrada.

Thresholds ficam em funções/configuração, não na UI.

### Saúde geral

Usar função central:

``` ts
calculateVehicleHealth(vehicleComponents)
```

Não inventar percentuais individuais. Componentes sem dados não devem
automaticamente ser considerados ruins.

### Abastecimento

``` text
total = liters × pricePerLiter
liters = total / pricePerLiter
pricePerLiter = total / liters
```

### Consumo

Priorizar tanque cheio → tanque cheio.

``` text
kmDriven = currentMileage - previousFullTankMileage
kmPerLiter = kmDriven / litersUsedInPeriod
```

Sem dados confiáveis, mostrar "Sem dados" em vez de estimar.

### Problemas

Novo problema começa como `open`. Estimativa não entra em Gastos e não
cria manutenção. Ao resolver, pode ser vinculado a uma manutenção.

### Melhorias

Nova melhoria começa como `planned`.

``` text
planned → purchased → installed
```

`estimated_budget` não entra em Gastos. Somente `actual_cost`.

## 12. Funções de domínio

``` text
calculateNextMaintenance()
calculateFuelValues()
calculateFuelEconomy()
calculateVehicleHealth()
calculateComponentStatus()
calculateMonthlyExpenses()
buildHistoryTimeline()
shouldUpdateVehicleMileage()
```

Essas funções não devem viver dentro das páginas React.

## 13. Estado e acesso a dados

Começar simples:

-   estado local para formulários;
-   Context apenas para usuário e veículo selecionado, se necessário;
-   services/repositories para Supabase;
-   evitar queries espalhadas diretamente pelas páginas.

Se cache e sincronização ficarem complexos, avaliar TanStack Query
depois.

## 14. Offline-friendly

O MVP deve tratar conexão instável sem exigir offline-first completo.

-   preservar formulário em falha;
-   loading/error claros;
-   cache básico quando útil;
-   arquitetura preparada para fila de sincronização futura.

## 15. Segurança Supabase

Usar **Row Level Security** desde o início.

O usuário só pode acessar registros ligados aos próprios veículos. Não
confiar apenas em `user_id` enviado pelo frontend.

Aplicar políticas equivalentes aos arquivos no Storage.

## 16. Dataset inicial

### Projeto Gol

``` text
Apelido: Projeto Gol
Marca: Volkswagen
Modelo: Gol
Motor: 1.0 8V
Ano: 2005
Quilometragem: 141.500 km
```

### Óleo

``` text
5W-40
Sintético
Mobil Super 3000
3,5 L

Última troca:
12/03/2026
132.700 km
R$ 180
Oficina do João

Intervalo:
10.000 km ou 12 meses

Próxima:
142.700 km ou março de 2027
```

### Abastecimento

``` text
12/08/2026
141.500 km
Gasolina
34,8 L
R$ 200
Posto Ipiranga
Tanque cheio
```

### Problema

``` text
Limpador traseiro não funciona
Sistema: Elétrica
Prioridade: Média
Status: Em aberto
```

### Melhoria

``` text
Alto-falantes das portas
Categoria: Som e multimídia
Prioridade: Média
Status: Planejado
```

## 17. Ordem de implementação

### Fase 0 --- Preparação

-   [ ] revisar arquitetura;
-   [ ] criar repositório;
-   [ ] extrair tokens finais do Figma.

### Fase 1 --- Fundação

-   [ ] React + TypeScript + Ionic;
-   [ ] Capacitor;
-   [ ] lint/format;
-   [ ] estrutura de pastas;
-   [ ] tema/tokens;
-   [ ] rotas;
-   [ ] Supabase;
-   [ ] variáveis de ambiente.

### Fase 2 --- Design System

-   [ ] AppHeader
-   [ ] BottomNavigation
-   [ ] FocusedFormHeader
-   [ ] Card
-   [ ] PrimaryButton
-   [ ] FormField
-   [ ] SelectField
-   [ ] MileageField
-   [ ] FilterChip
-   [ ] SegmentedControl
-   [ ] StatusLabel
-   [ ] QuickActionSheet

### Fase 3 --- Banco e autenticação

-   [ ] migrations;
-   [ ] tabelas e índices;
-   [ ] RLS;
-   [ ] Storage;
-   [ ] tipos TypeScript;
-   [ ] seed.

### Fase 4 --- Onboarding

-   [ ] boas-vindas;
-   [ ] cadastro manual;
-   [ ] quilometragem;
-   [ ] checagem inicial;
-   [ ] persistência;
-   [ ] conclusão.

### Fase 5 --- Meu Carro

-   [ ] Visão geral;
-   [ ] Componentes;
-   [ ] Informações;
-   [ ] Detalhe do sistema;
-   [ ] Detalhe do componente.

### Fase 6 --- Registros

-   [ ] manutenção;
-   [ ] abastecimento;
-   [ ] problema;
-   [ ] melhoria;
-   [ ] atualizar KM;
-   [ ] anexos.

### Fase 7 --- Home

-   [ ] saúde;
-   [ ] próxima manutenção;
-   [ ] consumo;
-   [ ] atenções;
-   [ ] gastos;
-   [ ] ações rápidas.

### Fase 8 --- Gastos e Histórico

-   [ ] agregação financeira;
-   [ ] gastos manuais;
-   [ ] filtros;
-   [ ] timeline;
-   [ ] busca.

### Fase 9 --- Qualidade

-   [ ] estados vazios;
-   [ ] loading/error;
-   [ ] validação;
-   [ ] testes das funções;
-   [ ] Android;
-   [ ] iOS;
-   [ ] acessibilidade;
-   [ ] performance.

## 18. Critérios para o MVP

O MVP está funcional quando o usuário consegue:

1.  cadastrar um carro;
2.  visualizar seus dados;
3.  acompanhar componentes;
4.  registrar manutenção;
5.  receber previsão da próxima manutenção;
6.  registrar abastecimento;
7.  obter consumo quando houver dados suficientes;
8.  registrar problema;
9.  registrar melhoria;
10. acompanhar gastos reais sem duplicidade;
11. consultar histórico;
12. fechar e reabrir o app sem perder dados.

## 19. Princípios

1.  Não programar telas isoladamente: reutilizar componentes.
2.  Não duplicar dados.
3.  Não inventar precisão quando faltam dados.
4.  Manter formulários rápidos.
5.  Separar UI de regra de negócio.
6.  Projetar para múltiplos veículos.
7.  Manter o MVP enxuto.
8.  Figma é referência visual; este documento é referência arquitetural.

## 20. Próximo passo

Após aprovar esta arquitetura:

1.  criar o repositório;
2.  iniciar Ionic + React + TypeScript;
3.  criar/configurar Supabase;
4.  implementar tokens do Design System;
5.  implementar App Shell, Header e Bottom Navigation;
6.  iniciar o Onboarding.

A arquitetura pode evoluir. Mudanças relevantes devem ser atualizadas
neste documento para que ele continue representando o CarBoard real.
