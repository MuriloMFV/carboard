# CarBoard — Feature: Registros

> Especificação para o Codex implementar o módulo **Registros** do CarBoard.
>
> Antes de alterar código, leia também a documentação geral existente em `docs/` e a especificação da feature Meu Carro.
>
> As imagens exportadas do Figma/Stitch são a **fonte de verdade visual**. Este arquivo define comportamento, arquitetura, mocks, regras de negócio e feedbacks de sucesso.

---

# 1. Objetivo desta etapa

Implementar os quatro fluxos principais de registro do CarBoard:

1. **Registrar manutenção**
2. **Registrar abastecimento**
3. **Registrar problema**
4. **Registrar melhoria**

Também preparar o fluxo de:

5. **Atualizar quilometragem**

Nesta etapa, os registros podem permanecer em memória/mocks. **Não integrar Supabase ainda.**

O objetivo é fechar o comportamento completo dos formulários e o sistema de feedback visual, mantendo o app pronto para persistência real posteriormente.

---

# 2. Rotas

Implementar/reutilizar:

```text
/register/maintenance
/register/fuel
/register/problem
/register/improvement
```

Atualizar quilometragem pode ser modal/bottom sheet, não precisa de rota própria se o design atual não exigir.

---

# 3. Quick Action Sheet

O botão central `+` já existe.

Ele deve continuar exibindo:

```text
Abastecimento
Manutenção
Problema
Melhoria
Atualizar quilometragem
```

Navegação:

```text
Abastecimento → /register/fuel
Manutenção → /register/maintenance
Problema → /register/problem
Melhoria → /register/improvement
Atualizar quilometragem → modal/bottom sheet
```

Reutilizar o `QuickActionSheet` existente.

Não duplicar esse componente.

---

# 4. Header dos formulários

Todos os formulários devem compartilhar o mesmo padrão:

```text
← Título
Projeto Gol · 141.500 km
```

Usar `FocusedHeader`.

Não mostrar:

- hamburger;
- sino;
- bottom navigation.

Esses fluxos são focados.

---

# 5. Vehicle context

Usar o mesmo mock centralizado do veículo:

```ts
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

Não hardcodar essas strings em cada formulário.

---

# 6. Estrutura sugerida da feature

Exemplo:

```text
src/features/records/
├── components/
│   ├── RecordFormSection.tsx
│   ├── SuccessFeedback.tsx
│   └── SuccessFeedback.css
├── domain/
│   ├── calculateFuelValues.ts
│   ├── shouldUpdateVehicleMileage.ts
│   └── recordSuccessConfig.ts
├── mocks/
│   └── records.ts
├── types.ts
└── record.css
```

Os nomes podem variar de acordo com o padrão existente.

---

# 7. Lottie / feedbacks de sucesso

Os assets oficiais já foram escolhidos.

Renomear/organizar para:

```text
src/assets/lottie/
├── maintenance.json
├── refueling.json
├── mileage.json
└── success.json
```

Mapeamento:

```text
maintenance.json → manutenção registrada
refueling.json   → abastecimento registrado
mileage.json     → quilometragem atualizada
success.json     → sucesso genérico
```

## Paleta recomendada

Se os JSONs já estiverem recoloridos, preservar.

Paleta CarBoard:

```text
Azul principal: #087FF5
Azul claro: #A9CCFF
Azul muito claro: #EAF3FF
Azul escuro: #102A5E
Fundo: transparente
```

Não obrigatoriamente editar JSON por código. Apenas preparar a arquitetura para usar os assets fornecidos.

---

# 8. SuccessFeedback

Criar um componente reutilizável:

```tsx
<SuccessFeedback
  type="maintenance"
  title="Manutenção registrada!"
  description="Próxima troca prevista em 10.000 km."
  onContinue={...}
/>
```

Tipos iniciais:

```ts
type SuccessFeedbackType =
  | 'maintenance'
  | 'fuel'
  | 'mileage'
  | 'generic';
```

O componente escolhe automaticamente a Lottie correspondente.

## Comportamento

Fluxo:

```text
salvar
→ validar
→ estado loading curto
→ feedback visual
→ mensagem
→ ação Continuar
```

Não fechar automaticamente feedbacks importantes.

Duração sugerida da animação:

```text
1–2 segundos
```

Não usar confetti.

Não usar animação excessiva.

---

# 9. Registrar manutenção

Rota:

```text
/register/maintenance
```

## Objetivo

Permitir registrar um serviço realizado no veículo.

Exemplo principal:

```text
Troca de óleo + filtro
```

## Campos

### Sistema

```text
Motor
```

### Componentes

Permitir múltipla seleção:

```text
☑ Óleo do motor
☑ Filtro de óleo
☐ Filtro de ar
```

Se o formulário for aberto a partir de um componente/sistema no futuro, permitir pré-seleção.

### Serviço realizado

Exemplo:

```text
Troca de óleo + filtro
```

Pode ser sugerido automaticamente a partir dos componentes selecionados.

### Data

Mock:

```text
12/08/2026
```

### Quilometragem

Mock:

```text
141.500 km
```

Usar o mesmo `MileageField`.

### Peças e produtos

Campos dinâmicos por componente.

Para óleo:

```text
Viscosidade: 5W-40
Tipo: Sintético
Marca/Produto: Mobil Super 3000
Quantidade: 3,5 L
```

Para filtro de óleo:

```text
+ Adicionar detalhes do produto
```

Não obrigar detalhes para todos os componentes.

### Custo e local

```text
Valor total: R$ 180,00
Oficina / Local: Oficina do João
```

Ambos opcionais.

### Observações

Textarea compacto, expansível.

### Comprovante

Ação compacta:

```text
+ Adicionar foto ou comprovante
```

Sem upload real nesta etapa.

### Próxima manutenção

Mostrar:

```text
Intervalo
10.000 km ou 12 meses

Próxima troca prevista
151.500 km ou agosto de 2027
```

Permitir ação visual:

```text
Editar intervalo
```

Sem fluxo completo de edição se não estiver no design.

## Botões

```text
Salvar manutenção
Cancelar
```

## Regra de custo

Manutenção com custo deverá futuramente alimentar Gastos automaticamente.

Nesta etapa, guardar essa regra em comentário/estrutura; não criar gasto duplicado.

## Feedback de sucesso

Usar:

```text
maintenance.json
```

Mensagem:

```text
Manutenção registrada!
```

Pode mostrar:

```text
Troca de óleo + filtro
141.500 km · 12 ago 2026
```

E:

```text
Próxima troca prevista
151.500 km ou agosto de 2027
```

Ação:

```text
Continuar
```

---

# 10. Registrar abastecimento

Rota:

```text
/register/fuel
```

## Objetivo

Registrar abastecimento de forma rápida.

## Campos

### Data

```text
12/08/2026
```

### Quilometragem

```text
141.500 km
```

### Combustível

Segmented control:

```text
Gasolina | Etanol
```

### Valor total

```text
R$ 200,00
```

### Litros

```text
34,8 L
```

### Preço por litro

```text
R$ 5,75/L
```

## Cálculo automático

Criar helper:

```ts
calculateFuelValues({
  totalCost,
  liters,
  pricePerLiter
})
```

Regras:

```text
total = liters * pricePerLiter
liters = total / pricePerLiter
pricePerLiter = total / liters
```

Se dois valores existirem, calcular o terceiro.

### Tanque cheio

Controle booleano:

```text
Tanque cheio: true
```

Quando falso, o registro continua válido, mas o consumo não deve ser calculado como se fosse um ciclo completo.

### Consumo

Mock esperado quando houver dados suficientes:

```text
11,8 km/L
```

Supporting text:

```text
412 km desde o último abastecimento
```

Não inventar consumo se faltarem dados.

### Posto

```text
Posto Ipiranga
```

Opcional.

### Observações

Campo compacto.

### Comprovante

Ação compacta.

## Botões

```text
Salvar abastecimento
Cancelar
```

## Regra de custo

Abastecimento com valor futuramente entra automaticamente em Gastos.

## Feedback de sucesso

Usar:

```text
refueling.json
```

Mensagem:

```text
Abastecimento registrado!
```

Mostrar:

```text
34,8 L de gasolina
R$ 200 · 141.500 km
```

Se houver consumo válido:

```text
Consumo deste período
11,8 km/L
```

Ação:

```text
Continuar
```

---

# 11. Registrar problema

Rota:

```text
/register/problem
```

## Objetivo

Registrar algo que ainda precisa ser resolvido.

Problema NÃO é manutenção.

## Campos

### O que está acontecendo?

Exemplo:

```text
Limpador traseiro não funciona
```

### Sistema relacionado

Exemplo:

```text
Elétrica
```

Permitir:

```text
Não sei
```

### Componente

Exemplo:

```text
Limpador traseiro
```

Opcional.

### Data

```text
12/08/2026
```

### Quilometragem

```text
141.500 km
```

### Prioridade

```text
Baixa | Média | Alta
```

Default:

```text
Média
```

Prioridade representa importância para o usuário resolver, não diagnóstico mecânico.

### Descrição

Exemplo:

```text
O motor não faz nenhum barulho quando aciono pelo comando.
```

### Fotos

Ação:

```text
+ Adicionar fotos
```

Sem upload real ainda.

### Estimativa de custo

Exemplo:

```text
R$ 150,00
```

Importante:

```text
estimativa ≠ gasto real
```

Não alimentar Gastos.

## Status inicial

Automaticamente:

```text
open
```

Labels futuros:

```text
Em aberto
Em acompanhamento
Resolvido
```

## Botões

```text
Registrar problema
Cancelar
```

## Feedback de sucesso

Usar inicialmente:

```text
success.json
```

Mensagem:

```text
Problema registrado!
```

Subtexto:

```text
Limpador traseiro não funciona
Elétrica · Prioridade média
```

Não usar animação de alerta agressiva.

---

# 12. Registrar melhoria

Rota:

```text
/register/improvement
```

## Objetivo

Registrar uma melhoria/upgrade planejado para o veículo.

## Campos

### O que você quer melhorar?

Exemplo:

```text
Alto-falantes das portas
```

### Categoria

Exemplo:

```text
Som e multimídia
```

Opções mock:

```text
Som e multimídia
Exterior
Interior
Iluminação
Rodas e pneus
Conforto
Performance
Segurança
Outro
```

### Prioridade

```text
Baixa | Média | Alta
```

Default:

```text
Média
```

### Orçamento estimado

```text
R$ 280,00
```

Importante:

```text
orçamento planejado ≠ gasto real
```

### Produto / peça

Exemplo:

```text
Kit alto-falantes 6"
```

### Link

Campo opcional.

### Foto

Ação compacta.

### Observações

Textarea.

## Status inicial

Automaticamente:

```text
planned
```

Fluxo futuro:

```text
planned → purchased → installed
```

## Botões

```text
Salvar melhoria
Cancelar
```

## Feedback de sucesso

Usar:

```text
success.json
```

Mensagem:

```text
Melhoria adicionada!
```

Subtexto:

```text
Alto-falantes das portas
Planejado · Prioridade média
```

---

# 13. Atualizar quilometragem

Abrir por modal/bottom sheet a partir do QuickActionSheet.

## Campo

```text
Quilometragem atual
141.500 km
```

Usuário pode digitar novo valor:

```text
142.350 km
```

## Regra

Nunca reduzir automaticamente a quilometragem atual.

Se valor for maior, aceitar.

Se valor for menor, avisar/impedir atualização automática nesta etapa.

Criar helper:

```ts
shouldUpdateVehicleMileage(currentMileage, nextMileage)
```

## Feedback de sucesso

Usar:

```text
mileage.json
```

Mensagem:

```text
Quilometragem atualizada!
```

Mostrar:

```text
141.500 → 142.350 km
```

Ação:

```text
Continuar
```

---

# 14. Estado temporário

Criar uma store/contexto simples para registros em memória.

Objetivo:

- permitir salvar registros nesta etapa;
- permitir testar feedbacks;
- permitir futuramente Home/Gastos/Histórico lerem esses registros mockados;
- não usar localStorage como banco definitivo.

Pode ser Context tipado ou solução equivalente simples.

Não instalar Redux/Zustand apenas para isso se não houver necessidade.

---

# 15. Tipos iniciais

Exemplo:

```ts
export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  title: string;
  componentIds: string[];
  totalCost?: number;
  workshop?: string;
  notes?: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  fuelType: 'gasoline' | 'ethanol';
  totalCost?: number;
  liters?: number;
  pricePerLiter?: number;
  fullTank: boolean;
  station?: string;
}

export interface ProblemRecord {
  id: string;
  vehicleId: string;
  title: string;
  date: string;
  mileage: number;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'monitoring' | 'resolved';
  estimatedCost?: number;
}

export interface ImprovementRecord {
  id: string;
  vehicleId: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'purchased' | 'installed';
  estimatedBudget?: number;
  actualCost?: number;
}
```

Ajustar ao padrão de tipos existente no projeto.

---

# 16. Integração futura com Gastos

Não implementar Gastos ainda, mas estruturar os registros corretamente.

Regra futura:

```text
Maintenance.totalCost → gasto real
Fuel.totalCost → gasto real
Improvement.actualCost → gasto real
Problem.estimatedCost → NÃO é gasto
Improvement.estimatedBudget → NÃO é gasto
```

Não criar objetos `Expense` duplicados nesta etapa.

---

# 17. Integração futura com Histórico

Os registros criados nesta etapa devem já conter:

- id;
- vehicleId;
- date;
- mileage quando aplicável;
- título;
- tipo;
- valores relevantes.

Assim, o futuro Histórico poderá normalizá-los sem refatoração grande.

---

# 18. Validação de formulários

Required mínimo:

## Maintenance

- sistema;
- ao menos um componente;
- data;
- quilometragem;
- serviço.

## Fuel

- data;
- quilometragem;
- combustível;
- pelo menos dois entre valor/litros/preço por litro.

## Problem

- título;
- data;
- quilometragem.

## Improvement

- título.

Não marcar visualmente todos os campos opcionais como `(Opcional)` se a referência não fizer isso.

---

# 19. Formatação

Reutilizar helpers existentes:

```text
141500 → 141.500 km
200 → R$ 200,00
5.75 → R$ 5,75
2026-08-12 → 12/08/2026
```

Locale:

```text
pt-BR
```

---

# 20. Fidelidade visual

Seguir as referências visuais correspondentes aos quatro registros.

Não redesenhar.

Não aceitar estilos padrão de Ionic que conflitem com CarBoard.

Comparar:

- header;
- cards;
- labels;
- inputs;
- segmented controls;
- checkboxes;
- botão principal;
- cancelar;
- espaçamento;
- cores;
- tipografia;
- safe areas.

---

# 21. Responsividade

Testar:

```text
360px
390px
430px
```

Garantir que:

- campos lado a lado continuem legíveis;
- botões não sejam cortados;
- conteúdo role corretamente;
- feedback de sucesso caiba na viewport.

---

# 22. Não implementar nesta etapa

NÃO implementar:

- Supabase;
- autenticação;
- banco real;
- upload real de imagens;
- Gastos;
- Histórico global;
- Home definitiva;
- notificações;
- push;
- offline-first;
- IA;
- OBD;
- leitura de comprovantes;
- mapa/postos.

---

# 23. Testes mínimos

Validar:

1. QuickActionSheet abre cada registro correto.
2. Manutenção salva mock.
3. Abastecimento calcula terceiro valor quando dois forem informados.
4. Tanque parcial não gera consumo falso.
5. Problema inicia `open`.
6. Melhoria inicia `planned`.
7. Estimativas não viram gastos.
8. KM maior pode atualizar.
9. KM menor não reduz automaticamente.
10. SuccessFeedback usa animação correta.
11. voltar/cancelar funciona.
12. dados permanecem em memória enquanto app está aberto.

---

# 24. Validação técnica

Ao concluir:

```bash
npm run lint
npm run build
```

Corrigir erros.

Warning conhecido do bundle Ionic >500 kB pode permanecer.

---

# 25. Relatório esperado

Responder com:

## Telas implementadas

Lista.

## Arquivos criados

Lista.

## Arquivos alterados

Lista.

## Componentes reutilizados

Lista.

## Componentes novos

Lista.

## Regras implementadas

Especialmente:

- cálculos de combustível;
- quilometragem;
- status inicial;
- validação;
- feedbacks Lottie.

## Assets utilizados

Confirmar os quatro JSONs e caminhos.

## Divergências

Qualquer diferença necessária em relação às referências.

## Validação

Resultado de lint/build.

Não avançar automaticamente para Home/Gastos/Histórico.

---

# 26. Ordem de execução

1. Ler documentação geral.
2. Analisar referências visuais dos registros.
3. Inspecionar forms existentes.
4. Adicionar os assets Lottie.
5. Criar `SuccessFeedback`.
6. Criar tipos/contexto/store em memória.
7. Implementar manutenção.
8. Implementar abastecimento.
9. Implementar problema.
10. Implementar melhoria.
11. Implementar atualizar KM.
12. Integrar QuickActionSheet.
13. Testar feedbacks de sucesso.
14. Testar responsividade.
15. Rodar lint/build.
16. Corrigir erros.
17. Apresentar relatório.
18. Parar e aguardar aprovação.

---

# Critério de aprovação

Esta etapa está pronta quando for possível:

```text
+
├── Manutenção → salvar → animação wrench → sucesso
├── Abastecimento → salvar → animação fuel → sucesso
├── Problema → salvar → animação success → sucesso
├── Melhoria → salvar → animação success → sucesso
└── Atualizar KM → salvar → animação odometer → sucesso
```

com visual fiel às referências, dados tipados, regras coerentes e sem Supabase.

> Prioridade: fechar a entrada de dados do CarBoard com UX clara, componentes reutilizáveis e feedback visual consistente.
