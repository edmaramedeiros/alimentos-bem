export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDateTimeBR(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

export function saleStatusLabel(status: 'PENDING' | 'PAID' | 'CANCELLED'): string {
  switch (status) {
    case 'PENDING':
      return 'Aguardando pagamento';
    case 'PAID':
      return 'Pago';
    case 'CANCELLED':
      return 'Cancelada';
  }
}
