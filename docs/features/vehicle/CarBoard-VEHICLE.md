# CarBoard --- Feature: Meu Carro

> Especificação para o Codex implementar o módulo **Meu Carro**. Antes
> de alterar código, leia a arquitetura e o contexto geral existentes em
> `docs/`.
>
> **Fonte de verdade visual:** imagens exportadas do Figma/Stitch. Este
> arquivo define comportamento, arquitetura, mocks e regras. Não
> redesenhe as referências.

## 1. Escopo

Implementar somente:

1.  Meu Carro --- Visão Geral
2.  Meu Carro --- Componentes
3.  Meu Carro --- Informações
4.  Detalhe do Sistema
5.  Detalhe do Componente

Rotas:

``` text
/vehicle
/vehicle/components
/vehicle/info
/vehicle/system/:systemId
/vehicle/component/:componentId
```

Não integrar Supabase nesta etapa.

## 2. Antes de implementar

1.  Localize e analise as cinco referências visuais correspondentes.
2.  Inspecione os componentes já existentes.
3.  Reutilize tokens, formatadores, `AppHeader`, `BottomNavigation`,
    `QuickActionSheet` e demais componentes aprovados.
4.  Não substitua o PNG oficial do Gol.
5.  Não altere Home ou onboarding sem necessidade.

## 3. Navegação compartilhada

As três páginas principais devem compartilhar:

-   `AppHeader`
-   `VehicleHeader`
-   tabs
-   `BottomNavigation`

Bottom navigation oficial:

``` text
Início | Meu Carro | + | Gastos | Histórico
```

`Meu Carro` fica ativo. O `+` continua abrindo o `QuickActionSheet`
existente.

Tabs:

``` text
Visão geral → /vehicle
Componentes → /vehicle/components
Informações → /vehicle/info
```

A tab ativa deve derivar da rota atual.

## 4. VehicleHeader

Reutilizar/criar um único componente compartilhado.

Mock:

``` ts
{
  id: 'vehicle-1',
  nickname: 'Projeto Gol',
  brand: 'Volkswagen',
  model: 'Gol',
  engine: '1.0 8V',
  year: 2005,
  currentMileage: 141500
}
```

Exibir conforme a referência:

``` text
Projeto Gol
Volkswagen Gol 1.0 · 2005
141.500 km
```

Usar o PNG transparente correto do Gol já fornecido no projeto.

## 5. Visão Geral

Rota: `/vehicle`.

Objetivo: visão rápida do estado do veículo sem duplicar a Home.

### Saúde geral

``` text
82%
Bom
31 itens OK
4 em atenção
```

O percentual existe **somente na saúde geral**. Sistemas individuais não
possuem percentuais.

### Sistemas

Mocks coerentes com a referência, por exemplo:

``` text
Motor
8 componentes · Bom

Freios
5 componentes · Bom

Suspensão
5 OK · 2 em atenção

Pneus
4 componentes · Bom

Elétrica
3 OK · 1 em atenção
```

Cada sistema clicável navega para `/vehicle/system/:systemId`.

Quando previsto no design, exibir itens que precisam de atenção. Não
inventar diagnóstico mecânico.

## 6. Componentes

Rota: `/vehicle/components`.

### Busca

Campo `Buscar componente`.

Filtrar mocks pelo nome, case-insensitive.

### Filtros

Reutilizar `FilterChip`:

``` text
Todos
Bom
Atenção
Crítico
Sem dados
```

Se a referência organizar visualmente de outra maneira, preservar o
design sem mudar a semântica.

### Lista

Agrupar por sistema quando a referência indicar.

Exemplo:

``` text
MOTOR

Óleo do motor
Bom
Próxima troca em 1.200 km

Filtro de óleo
Bom

Correia dentada
Sem dados
```

Clique → `/vehicle/component/:componentId`.

Manter `+ Adicionar componente` visualmente. Não criar fluxo/tela de
cadastro nesta etapa.

## 7. Informações

Rota: `/vehicle/info`.

Mostrar dados conforme referência:

``` text
Apelido: Projeto Gol
Marca: Volkswagen
Modelo: Gol
Motor: 1.0 8V
Ano: 2005
Quilometragem: 141.500 km
```

Outros campos presentes no design podem aparecer.

Não inventar placa, chassi ou dados oficiais. Não criar tela adicional
de edição.

## 8. Detalhe do Sistema

Rota genérica:

``` text
/vehicle/system/:systemId
```

Primeiro caso real:

``` text
/vehicle/system/motor
```

Usar `FocusedHeader`, por exemplo:

``` text
← Motor
```

Não criar uma página React diferente para cada sistema.

Mostrar nome, resumo, quantidade e lista de componentes. Componentes
clicam para `/vehicle/component/:componentId`.

Nunca mostrar:

``` text
Motor 92%
```

Arquitetar para suportar futuramente Motor, Freios, Suspensão, Pneus,
Arrefecimento e Elétrica.

## 9. Detalhe do Componente

Rota genérica:

``` text
/vehicle/component/:componentId
```

Primeiro componente demonstrado: **Óleo do motor**.

Usar `FocusedHeader`.

Não criar uma `OilPage` hardcoded; usar página genérica alimentada por
dados.

### Mock oficial do óleo

``` text
Componente: Óleo do motor
Sistema: Motor
Status: Bom

Produto: Mobil Super 3000
Viscosidade: 5W-40
Tipo: Sintético
Quantidade: 3,5 L

Última troca: 12/03/2026
KM da última troca: 132.700 km
Custo: R$ 180
Oficina: Oficina do João

Intervalo: 10.000 km ou 12 meses
Próxima por KM: 142.700 km
Próxima por data: março de 2027
KM atual: 141.500 km
```

Logo:

``` text
142.700 - 141.500 = 1.200 km
```

A interface pode mostrar `Próxima troca em 1.200 km`.

Seguir a referência para os blocos: estado atual, próxima manutenção,
intervalo, produto atual, última manutenção e histórico.

## 10. Cálculo de manutenção

Criar função de domínio reutilizável, fora do JSX:

``` ts
calculateNextMaintenance({
  lastServiceMileage,
  lastServiceDate,
  intervalKm,
  intervalMonths,
  currentMileage,
})
```

Regras:

``` text
nextMileage = lastServiceMileage + intervalKm
nextDate = lastServiceDate + intervalMonths
remainingKm = nextMileage - currentMileage
```

Se algum intervalo não existir, calcular somente o disponível. Não
inventar valores.

## 11. Status

Tipo:

``` ts
type ComponentStatus =
  | 'good'
  | 'attention'
  | 'critical'
  | 'no_data';
```

Labels:

``` text
good → Bom
attention → Atenção
critical → Crítico
no_data → Sem dados
```

Cores: Bom azul; Atenção laranja; Crítico vermelho; Sem dados cinza.

Centralizar tradução/estilo em helper ou configuração. Não espalhar
condicionais pelas páginas.

## 12. Mocks

Centralizar mocks dentro da feature, por exemplo:

``` text
src/features/vehicles/
├── mocks/
│   ├── vehicle.ts
│   ├── systems.ts
│   └── components.ts
```

Não duplicar `Projeto Gol`, `141500` ou os dados do óleo em vários
arquivos.

Criar IDs/slugs estáveis para sistemas e componentes.

## 13. Componentes React

Reutilizar os existentes. Criar somente quando necessário, por exemplo:

``` text
VehicleTabs
VehicleHealthCard
SystemSummaryRow
ComponentRow
MaintenanceForecast
ComponentProductCard
MaintenanceHistoryRow
```

Evitar componentes excessivamente específicos.

## 14. Formatação

Reutilizar formatadores existentes e `pt-BR`:

``` text
141500 → 141.500 km
180 → R$ 180,00
2026-03-12 → 12 mar 2026
```

Não criar funções concorrentes para a mesma formatação.

## 15. Fidelidade visual

As referências do Figma/Stitch têm prioridade visual.

Comparar:

-   padding lateral;
-   gaps;
-   largura e raio dos cards;
-   pesos/tamanhos tipográficos;
-   altura do header;
-   posição/tamanho do Gol;
-   tabs;
-   divisores;
-   ícones;
-   cores;
-   bottom navigation.

Não aceitar automaticamente o visual padrão de `IonCard`, `IonButton` ou
`IonSegment`. O resultado deve parecer **CarBoard**, não template Ionic.

## 16. Mobile e acessibilidade

Testar no mínimo em 360px, 390px e 430px.

Evitar overflow horizontal, tabs quebradas, botão `+` cortado e conteúdo
atrás da bottom navigation.

Usar labels acessíveis, áreas clicáveis adequadas e não depender
exclusivamente de cor para estados importantes.

## 17. Não implementar

Não implementar agora:

-   Supabase;
-   autenticação;
-   persistência real;
-   CRUD real;
-   fluxo de adicionar componente;
-   edição real do veículo;
-   registros de manutenção/abastecimento/problema/melhoria;
-   Gastos;
-   Histórico global;
-   notificações;
-   side menu completo;
-   diagnóstico;
-   OBD;
-   IA;
-   busca por placa.

Não redesenhar Home, onboarding, AppHeader, BottomNavigation ou
QuickActionSheet.

## 18. Qualidade

Obrigatório:

-   TypeScript;
-   evitar `any`;
-   mocks centralizados;
-   componentes reutilizáveis;
-   funções de domínio fora das páginas;
-   evitar CSS duplicado;
-   nomes de código em inglês;
-   textos de UI em português;
-   preservar a arquitetura existente.

## 19. Testes mínimos

Validar:

1.  `/vehicle` abre Visão Geral.
2.  tabs navegam corretamente.
3.  Motor abre `/vehicle/system/motor`.
4.  Óleo abre a rota do componente.
5.  voltar funciona.
6.  `+` continua abrindo QuickActionSheet.
7.  bottom navigation continua funcionando.
8.  busca filtra componentes.
9.  filtros funcionam localmente.
10. cálculo do óleo retorna 1.200 km restantes.
11. mocks não se contradizem.

## 20. Validação técnica

Ao terminar:

``` bash
npm run lint
npm run build
```

Corrigir erros. O warning conhecido de bundle Ionic \>500 kB pode
permanecer; não introduzir code splitting só para removê-lo.

## 21. Relatório esperado

Ao concluir, informar:

-   telas implementadas;
-   arquivos criados;
-   arquivos alterados;
-   componentes reutilizados;
-   componentes novos;
-   regras implementadas;
-   divergências em relação às referências;
-   resultado de lint/build.

**Não prossiga automaticamente para outra feature.**

## 22. Ordem de execução

1.  Leia documentação geral.
2.  Analise referências visuais de Meu Carro.
3.  Inspecione componentes existentes.
4.  Planeje reutilização.
5.  Centralize mocks.
6.  Implemente VehicleHeader/tabs compartilhados.
7.  Implemente Visão Geral.
8.  Implemente Componentes.
9.  Implemente Informações.
10. Implemente Detalhe do Sistema genérico.
11. Implemente Detalhe do Componente genérico.
12. Implemente helper de manutenção.
13. Valide navegação e responsividade.
14. Rode lint/build.
15. Corrija erros.
16. Apresente relatório e pare.

## Critério de aprovação

O fluxo deve funcionar:

``` text
Meu Carro
   ↓
Visão Geral ↔ Componentes ↔ Informações
   ↓
Motor
   ↓
Óleo do motor
```

com visual fiel às referências, dados coerentes, componentes
reutilizáveis e sem dependência de Supabase.

> Prioridade: transformar o design de Meu Carro em uma feature
> reutilizável e preparada para dados reais posteriormente, sem
> overengineering.
