# CarBoard — Contexto para Codex no VS Code

## Objetivo deste arquivo

Este documento deve ser usado como contexto principal para o Codex no VS Code ao criar a base do projeto CarBoard.

O objetivo desta primeira etapa é montar a fundação do aplicativo, não implementar todas as funcionalidades finais.

O Codex deve:

1. criar o projeto-base;
2. organizar a arquitetura;
3. configurar Ionic + React + TypeScript + Capacitor;
4. montar o design system inicial;
5. criar navegação, shell principal e componentes reutilizáveis;
6. deixar o projeto preparado para Supabase;
7. implementar somente a fundação visual e estrutural necessária para começar o desenvolvimento das telas.

Não inventar funcionalidades além do que está definido neste documento.

---

# 1. O que é o CarBoard

O CarBoard é um aplicativo mobile para donos de carro.

A proposta é centralizar em um único lugar:

- manutenção;
- status de peças e componentes;
- quilometragem;
- abastecimentos;
- consumo;
- problemas pendentes;
- melhorias/upgrades;
- gastos;
- histórico do veículo.

O produto deve funcionar como um painel de controle completo do carro.

A referência conceitual mais próxima é:

> “Apple Health para o carro”

Mas o produto é mais amplo do que saúde/manutenção. Ele é um centro completo de acompanhamento da vida do veículo.

---

# 2. Público

O app deve servir para qualquer dono de carro.

O usuário não precisa entender de mecânica.

A interface deve sempre preferir linguagem simples.

Exemplo bom:

> Troca recomendada em aproximadamente 1.200 km.

Exemplo ruim:

> Oil service interval threshold approaching.

O app não deve fingir que diagnostica mecanicamente o veículo.

---

# 3. Stack definida

Usar:

- React
- TypeScript
- Ionic React
- Capacitor
- Vite
- Supabase futuramente
- PostgreSQL via Supabase
- Supabase Auth futuramente
- Supabase Storage futuramente
- Lucide Icons ou equivalente único e consistente
- Lottie futuramente para animações ilustrativas específicas

Evitar dependências extras desnecessárias.

---

# 4. Estrutura esperada do projeto

```text
carboard/
├── docs/
│   ├── ARCHITECTURE.md
│   └── CODEX_CONTEXT.md
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── forms/
│   │   └── vehicle/
│   ├── features/
│   │   ├── vehicles/
│   │   ├── components/
│   │   ├── maintenance/
│   │   ├── fuel/
│   │   ├── problems/
│   │   ├── improvements/
│   │   ├── expenses/
│   │   └── history/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   │   └── supabase/
│   ├── types/
│   ├── utils/
│   ├── theme/
│   └── assets/
├── capacitor.config.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

Não concentrar toda a aplicação em poucos arquivos grandes.

---

# 5. Design visual

O CarBoard possui um design system já definido visualmente.

Direção:

- clean;
- premium;
- utilitário;
- minimalista;
- mobile-first;
- levemente automotivo;
- inspirado na clareza dos apps nativos da Apple;
- sem estética racing.

## Cores

Cor principal:

- azul elétrico CarBoard

Background:

- branco / off-white

Estados:

- Bom → azul
- Atenção → laranja
- Crítico → vermelho
- Sem dados → cinza
- Melhorias → roxo
- Verde pode aparecer pontualmente em resultados positivos, como consumo, mas não deve dominar a UI.

## Evitar

- carbon fiber;
- speedometers falsos;
- HUD futurista;
- neon;
- glassmorphism exagerado;
- gradientes excessivos;
- cards demais;
- sombras pesadas;
- pills/badges para absolutamente tudo.

---

# 6. Navegação principal

A bottom navigation oficial do CarBoard é:

```text
Início | Meu Carro | + | Gastos | Histórico
```

O botão central `+` é circular, azul e destacado.

Ele abre um bottom sheet, não uma nova tela.

Opções do bottom sheet:

- Abastecimento
- Manutenção
- Problema
- Melhoria
- Atualizar quilometragem

---

# 7. Header principal

Nas telas principais:

```text
☰        CarBoard        🔔
```

- fundo azul CarBoard;
- ícones brancos;
- texto branco;
- hamburger à esquerda;
- CarBoard centralizado;
- sino à direita.

Nas telas profundas e formulários:

```text
←        Título
```

Nessas telas não usar hamburger.

---

# 8. Rotas planejadas

```text
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

---

# 9. Telas já definidas no design

As telas já foram desenhadas em Figma/Stitch.

Nesta primeira implementação-base, não é necessário replicar todas ainda.

Mas a arquitetura deve suportar:

## Onboarding

1. Welcome
2. Identificação do veículo
3. Quilometragem
4. Check inicial
5. Setup Complete

## Aplicação principal

- Home
- Meu Carro — Visão geral
- Meu Carro — Componentes
- Meu Carro — Informações
- Detalhe do Sistema — Motor
- Detalhe do Componente — Óleo do motor
- Registrar manutenção
- Registrar abastecimento
- Registrar problema
- Registrar melhoria
- Gastos
- Histórico
- Quick Action Bottom Sheet
- Side Menu

---

# 10. Primeira entrega esperada do Codex

Nesta primeira etapa, implementar APENAS:

## Fundação técnica

- Ionic React + TypeScript
- Capacitor configurado
- React Router / Ionic Router configurado
- estrutura de pastas
- tema global
- tokens CSS
- reset básico
- componentes base
- rotas funcionando
- páginas placeholder onde necessário

## Fundação visual

Implementar:

- `AppHeader`
- `FocusedHeader`
- `BottomNavigation`
- `QuickActionSheet`
- `PageContainer`
- `Card`
- `PrimaryButton`
- `SecondaryButton`
- `FilterChip`
- `SegmentedControl`
- `StatusText`
- `VehicleHeader`

## Shell inicial

Criar uma Home simples com:

- header oficial;
- conteúdo placeholder;
- bottom navigation;
- botão central `+`;
- bottom sheet funcional.

Não implementar lógica real do veículo ainda.

---

# 11. Componentes esperados

## Layout

- AppHeader
- FocusedHeader
- BottomNavigation
- PageContainer
- VehicleHeader

## UI

- Card
- PrimaryButton
- SecondaryButton
- IconButton
- StatusText
- FilterChip
- SegmentedControl
- Divider
- QuickActionSheet

## Forms

- FormField
- SelectField
- DateField
- MileageField
- CurrencyField
- TextareaField

Ainda não precisam ter toda a lógica final, mas devem existir com boa base visual e tipagem.

---

# 12. Tokens

Criar tokens centralizados.

```css
:root {
  --cb-primary: #2563eb;
  --cb-background: #f7f9fc;
  --cb-surface: #ffffff;

  --cb-text: #172033;
  --cb-text-muted: #7b8496;

  --cb-attention: #f59e0b;
  --cb-critical: #ef4444;
  --cb-upgrade: #8b5cf6;
  --cb-success: #16a34a;

  --cb-border: #e5e9f0;

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

As cores exatas podem ser ajustadas depois com base no Figma.

---

# 13. Dados mock iniciais

```ts
const mockVehicle = {
  id: 'vehicle-1',
  nickname: 'Projeto Gol',
  brand: 'Volkswagen',
  model: 'Gol',
  engine: '1.0 8V',
  year: 2005,
  currentMileage: 141500,
};
```

Não espalhar strings repetidas pelo projeto.

Criar mocks centralizados.

---

# 14. Tipos TypeScript iniciais

```ts
export interface Vehicle {
  id: string;
  nickname?: string;
  brand: string;
  model: string;
  year: number;
  engine?: string;
  currentMileage: number;
}

export type ComponentStatus =
  | 'good'
  | 'attention'
  | 'critical'
  | 'no_data';

export type ProblemPriority =
  | 'low'
  | 'medium'
  | 'high';

export type ProblemStatus =
  | 'open'
  | 'monitoring'
  | 'resolved';

export type ImprovementStatus =
  | 'planned'
  | 'purchased'
  | 'installed';
```

---

# 15. Regras importantes do produto

## Gastos

Não duplicar gasto.

Manutenção com valor já entra automaticamente em Gastos.

Abastecimento com valor já entra automaticamente em Gastos.

## Melhorias

Orçamento planejado não é gasto. Somente valor efetivamente pago entra.

## Problemas

Estimativa de custo não é gasto.

Problema não é manutenção.

Fluxo:

```text
problema percebido
→ problema em aberto
→ reparo
→ resolvido
→ histórico
```

## Quilometragem

Nunca reduzir automaticamente a quilometragem atual.

## Saúde

Não inventar precisão.

Sistemas não têm percentual individual.

Exemplo correto:

```text
Motor
8 componentes · Bom
```

Percentual existe somente na saúde geral do carro.

---

# 16. Supabase

Não é obrigatório conectar o Supabase nesta primeira entrega se isso atrapalhar a fundação do projeto.

Mas preparar:

```text
src/services/supabase/
```

Criar futuramente `client.ts` usando:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Nunca hardcodear credenciais.

---

# 17. Qualidade do código

O Codex deve:

- usar TypeScript corretamente;
- evitar `any`;
- evitar arquivos gigantes;
- criar componentes reutilizáveis;
- manter nomes em inglês no código;
- manter textos de UI em português;
- separar estilo e lógica quando fizer sentido;
- evitar lógica de negócio nas páginas;
- criar código simples e legível;
- não overengineer.

---

# 18. Responsividade

O foco é mobile.

A interface deve ser otimizada para aproximadamente:

```text
360px–430px de largura
```

Também deve funcionar razoavelmente em telas maiores.

Não criar layout desktop nesta etapa.

---

# 19. Ionic

Usar Ionic onde ele agrega valor:

- IonApp
- IonRouterOutlet
- IonPage
- IonContent
- IonModal quando útil
- integração Capacitor

Mas evitar aceitar automaticamente o visual padrão do Ionic.

O design deve seguir o CarBoard.

---

# 20. Primeira tarefa concreta para o Codex

Ao receber este contexto, executar:

1. verificar se já existe projeto;
2. se não existir, criar Ionic React + TypeScript;
3. configurar Capacitor;
4. criar a estrutura de pastas;
5. criar tokens/theme;
6. criar tipos iniciais;
7. criar mocks;
8. criar AppHeader;
9. criar FocusedHeader;
10. criar BottomNavigation;
11. criar QuickActionSheet;
12. criar VehicleHeader;
13. criar páginas placeholder;
14. configurar rotas;
15. montar Home inicial;
16. testar `npm run build`;
17. corrigir erros;
18. atualizar README com instruções de execução.

---

# 21. Resultado esperado

Ao final desta primeira etapa, deve ser possível executar:

```bash
npm install
npm run dev
```

e visualizar:

- app carregando;
- Home;
- header azul;
- bottom navigation;
- botão `+`;
- bottom sheet funcional;
- navegação básica;
- estrutura pronta para evoluir.

O projeto deve estar limpo o suficiente para começarmos o onboarding imediatamente depois.

---

# 22. Importante: não fazer agora

Não implementar todas as telas de uma vez.

Não conectar lógica complexa de Supabase.

Não criar banco inteiro sem revisão.

Não inventar features.

Não criar analytics complexos.

Não adicionar autenticação completa agora.

Não adicionar notificações push agora.

Não adicionar OBD.

Não adicionar IA.

Não adicionar recursos sociais.

Não fazer redesign.

---

# 23. Prioridade máxima

A prioridade desta primeira entrega é:

> fundação limpa, consistente e preparada para crescer.

O objetivo não é quantidade de telas.

É criar uma base boa para o restante do CarBoard.
