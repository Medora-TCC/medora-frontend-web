const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatMoney = (value: number) => currencyFormatter.format(value);

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");