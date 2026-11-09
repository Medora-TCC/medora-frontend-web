type Sex = 'Unknown' | 'Male' | 'Female' | 'Intersex';

const sexLabels: Record<Sex, string> = {
  Unknown: 'Não informado',
  Male: 'Masculino',
  Female: 'Feminino',
  Intersex: 'Intersexo',
};

export const formatSex = (sex: Sex) => sexLabels[sex] ?? 'Não informado';