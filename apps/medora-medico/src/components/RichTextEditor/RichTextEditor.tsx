import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode, HeadingNode } from "@lexical/rich-text";
import { $createParagraphNode, $getRoot } from "lexical";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ForwardedRef,
  type JSX,
} from "react";
import { ToolbarPlugin } from "./ToolbarPlugin";

const AUTOSAVE_DEBOUNCE_MS = 1000;

// Escala compacta: o h3 (usado pelo modelo SOAP) tem o mesmo tamanho do texto, só em negrito.
const theme = {
  text: {
    bold: "font-bold",
    underline: "underline",
    strikethrough: "line-through",
  },
  heading: {
    h1: "text-xl font-bold mt-2",
    h2: "text-lg font-bold mt-2",
    h3: "text-base font-bold mt-2",
  },
  list: {
    ul: "list-disc ml-6",
    ol: "list-decimal ml-6",
  },
};

function onError(error: Error): void {
  console.error(error);
}

const NODES = [HeadingNode, ListNode, ListItemNode];

// Fora do componente: o LexicalComposer só lê a config inicial, então não precisa recriá-la a cada render.
const EDITOR_CONFIG = { namespace: "EditorProntuario", theme, onError, nodes: NODES };
const VIEWER_CONFIG = { namespace: "MedicalRecordViewer", theme, onError, nodes: NODES, editable: false };

export interface RichTextEditorRef {
  /** Esvazia o editor. */
  clear: () => void;
  /** Se houver alteração aguardando o debounce, emite `setText` agora (use antes de salvar/finalizar). */
  flush: () => void;
}

interface RichTextProps {
  setText: (e: string) => void;
  setIsEmpty: (e: boolean) => void;
  content: string | null;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextProps>(
  ({ setText, setIsEmpty, content }, ref) => (
    <LexicalComposer initialConfig={EDITOR_CONFIG}>
      {/* Um único painel: barra de ferramentas colada no topo, área de escrita ocupa o resto */}
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface-raised">
        <ToolbarPlugin />
        <div className="relative min-h-0 flex-1">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="h-full overflow-y-auto px-4 py-3 text-text-primary outline-none"
                aria-label="Evolução clínica"
              />
            }
            placeholder={
              <p className="pointer-events-none absolute left-4 top-3 text-text-muted">
                Descreva a evolução clínica…
              </p>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <EditorSyncPlugin onChange={setText} setIsEmpty={setIsEmpty} apiRef={ref} />
          <LoadContentPlugin json={content} />
        </div>
      </div>
    </LexicalComposer>
  ),
);

RichTextEditor.displayName = "RichTextEditor";

export function MedicalRecordViewer({ json }: { json: string }): JSX.Element {
  // Altura natural: quem rola é o contêiner pai (página ou corpo do modal).
  // Antes, `h-full` + `overflow-y-hidden` cortava prontuários longos.
  return (
    <LexicalComposer initialConfig={VIEWER_CONFIG}>
      <div className="min-h-full w-full rounded-xl border border-border bg-surface-raised px-4 py-3">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="cursor-default text-text-primary outline-none"
              aria-label="Prontuário (somente leitura)"
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <LoadContentPlugin json={json} />
      </div>
    </LexicalComposer>
  );
}

function LoadContentPlugin({ json: content }: { json: string | null }): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!content) return;
    editor.setEditorState(editor.parseEditorState(content));
  }, [editor, content]);

  return null;
}

/**
 * "Tem corpo" = existe texto fora de headings.
 * Assim o modelo SOAP (só títulos) não conta como prontuário preenchido.
 */
function $hasBody(): boolean {
  return $getRoot()
    .getChildren()
    .some((node) => !$isHeadingNode(node) && node.getTextContent().trim() !== "");
}

interface EditorSyncProps {
  onChange: (json: string) => void;
  setIsEmpty: (empty: boolean) => void;
  apiRef: ForwardedRef<RichTextEditorRef>;
}

/**
 * Ponte entre o Lexical e o resto da tela:
 *  - `setIsEmpty` é atualizado na hora (inclusive ao carregar um rascunho existente);
 *  - `onChange` segue com debounce, mas pode ser forçado via `flush()`;
 *  - alteração pendente é emitida ao desmontar, para não perder o último trecho.
 */
function EditorSyncPlugin({ onChange, setIsEmpty, apiRef }: EditorSyncProps): null {
  const [editor] = useLexicalComposerContext();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmptyRef = useRef<boolean | null>(null);

  // Callbacks em ref: o listener é registrado uma vez e sempre chama a versão mais recente.
  const onChangeRef = useRef(onChange);
  const setIsEmptyRef = useRef(setIsEmpty);
  useEffect(() => {
    onChangeRef.current = onChange;
    setIsEmptyRef.current = setIsEmpty;
  });

  const emit = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onChangeRef.current(JSON.stringify(editor.getEditorState().toJSON()));
  }, [editor]);

  useImperativeHandle(
    apiRef,
    () => ({
      flush: () => {
        if (timerRef.current) emit();
      },
      clear: () => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          root.append($createParagraphNode());
        });
      },
    }),
    [editor, emit],
  );

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      const empty = editorState.read(() => !$hasBody());
      if (lastEmptyRef.current !== empty) {
        lastEmptyRef.current = empty;
        setIsEmptyRef.current(empty);
      }

      // Mudança só de seleção (ou carga do estado inicial) não precisa gerar salvamento.
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(emit, AUTOSAVE_DEBOUNCE_MS);
    });

    return () => {
      unregister();
      if (timerRef.current) emit();
    };
  }, [editor, emit]);

  return null;
}