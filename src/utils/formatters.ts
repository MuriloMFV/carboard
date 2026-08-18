export const formatMileage = (mileage: number): string =>
  new Intl.NumberFormat('pt-BR').format(mileage);

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);

const parseLocalDate = (date: string): Date => new Date(`${date}T00:00:00Z`);

export const formatDate = (date: string): string =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseLocalDate(date)).replace('.', '');

export const formatMonthYear = (date: string): string =>
  new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseLocalDate(date));
