export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDateTimeBR(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

/** Formata uma data pura "yyyy-MM-dd" (sem horário) como dd/MM/yyyy, sem risco de fuso mudar o dia. */
export function formatDateBR(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-');
  return `${day}/${month}/${year}`;
}

export function expenseCategoryLabel(category: 'MATERIA_PRIMA' | 'SUPRIMENTOS' | 'LOGISTICA' | 'TAXAS'): string {
  switch (category) {
    case 'MATERIA_PRIMA':
      return 'Matéria-prima';
    case 'SUPRIMENTOS':
      return 'Suprimentos';
    case 'LOGISTICA':
      return 'Logística';
    case 'TAXAS':
      return 'Taxas';
  }
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

/**
 * Formata progressivamente um telefone brasileiro no padrão (DD) 9XXXX-XXXX
 * conforme o usuário digita. Usado como máscara em campos de telefone.
 */
/** Formata "2026-08" como "agosto de 2026". */
export function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
}

/** Formata progressivamente uma data no padrão DD/MM/AAAA conforme o usuário digita. */
export function formatDateMask(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/** Converte "DD/MM/AAAA" para "AAAA-MM-DD" (formato aceito pelo backend); retorna null se incompleta. */
export function dateMaskToISO(masked: string): string | null {
  const match = masked.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

export function todayDateMask(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${now.getFullYear()}`;
}

export function formatPhoneMask(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}
