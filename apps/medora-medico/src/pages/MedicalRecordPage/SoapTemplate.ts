/**
 * Modelo SOAP no formato serializado do Lexical.
 * Usa apenas ParagraphNode + TextNode (negrito = format 1), que existem em qualquer
 * configuração do Lexical, então não depende de HeadingNode estar registrado no seu editor.
 * O prontuário continua sendo UM documento: o backend não muda.
 */
const text = (value: string, format = 0) => ({
  detail: 0,
  format,
  mode: "normal",
  style: "",
  text: value,
  type: "text",
  version: 1,
});

const paragraph = (children: ReturnType<typeof text>[]) => ({
  children,
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
    children: SECTIONS.flatMap((label) => [paragraph([text(label, 1)]), paragraph([])]),
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});