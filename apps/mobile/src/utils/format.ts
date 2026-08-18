export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDateTimeBR(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

export function saleStatusLabel(status: 'AWAITING_DELIVERY' | 'AWAITING_PAYMENT' | 'PAID' | 'CANCELLED'): string {
  switch (status) {
    case 'AWAITING_DELIVERY':
      return 'Aguardando entrega';
    case 'AWAITING_PAYMENT':
      return 'Aguardando pagamento';
    case 'PAID':
      return 'Pago';
    case 'CANCELLED':
      return 'Cancelada';
  }
}

export function paymentMethodLabel(method: 'DINHEIRO' | 'PIX' | 'CARTAO' | 'TRANSFERENCIA' | 'OUTRO'): string {
  switch (method) {
    case 'DINHEIRO':
      return 'Dinheiro';
    case 'PIX':
      return 'Pix';
    case 'CARTAO':
      return 'Cartão';
    case 'TRANSFERENCIA':
      return 'Transferência';
    case 'OUTRO':
      return 'Outro';
  }
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
}
