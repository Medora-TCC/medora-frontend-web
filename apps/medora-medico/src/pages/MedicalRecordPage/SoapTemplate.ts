/**
 * Modelo SOAP no formato serializado do Lexical.
 * Cada seção é um heading h3 (HeadingNode já está registrado no RichTextEditor),
 * seguido de um parágrafo vazio para o médico escrever.
 * O prontuário continua sendo UM documento: o backend não muda.
 *
 * O RichTextEditor considera o documento "vazio" enquanto só houver headings,
 * então o modelo recém-inserido não habilita o botão de finalizar.
 */
const heading = (label: string) => ({
  children: [{ detail: 0, format: 0, mode: "normal", style: "", text: label, type: "text", version: 1 }],
  direction: "ltr",
  format: "",
  indent: 0,
  type: "heading",
  version: 1,
  tag: "h3",
});

const emptyParagraph = () => ({
  children: [],
  direction: "ltr",
  format: "",
  indent: 0,
  type: "paragraph",
  version: 1,
  textFormat: 0,
  textStyle: "",
});

const SECTIONS = ["Subjetivo", "Objetivo", "Avaliação", "Plano"];

export const SOAP_TEMPLATE = JSON.stringify({
  root: {
    children: SECTIONS.flatMap((label) => [heading(label), emptyParagraph()]),
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});