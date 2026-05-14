import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { useEffect, useRef, useState, type JSX } from "react";
import { ToolbarPlugin } from "./ToolbarPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const theme = {
  text: {
    bold: "font-bold",
    underline: "underline",
    strikethrough: "line-through",
  },
  heading: {
    h1: "text-4xl font-bold",
    h2: "text-3xl font-bold",
    h3: "text-2xl font-semibold",
  },
  list: {
    ul: "list-disc ml-6",
    ol: "list-decimal ml-6",
  },
};

function onError(error: Error): void {
  console.error(error);
}

export function RichTextEditor(): JSX.Element {

  const [text, setText] = useState<string>("")

  useEffect(() => {
    console.log(text);
  }, [text])

  const initialConfig = {
    namespace: "EditorProntuario",
    theme: theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="flex flex-col h-full border border-slate-200 p-1 rounded-2xl overflow-hidden shadow-sm mx-4">
        <ToolbarPlugin />
        <div className=" h-full w-full overflow-hidden">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="h-full mt-2 p-4 outline-none bg-white text-slate-800 overflow-y-scroll" aria-label="Digite o prontuário" />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <GetContentPlugin onChange={setText} />
        </div>
      </div>
    </LexicalComposer>
  );
}

export function MedicalRecordViewer({ json }: { json: string }): JSX.Element {

  const initialConfig = {
    namespace: "MedicalRecordViewer",
    theme: theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode],
    editable: false
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border border-slate-200 p-4 rounded-2xl bg-white">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="outline-none text-slate-800 cursor-default" />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <LoadContentPlugin json={json} />
      </div>
    </LexicalComposer>
  )
}

function LoadContentPlugin({ json }: { json: string }): null {

  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const editorState = editor.parseEditorState(json);
    editor.setEditorState(editorState);
  }, [editor, json])

  return null;
}

function GetContentPlugin({ onChange }: { onChange: (text: string) => void }): null {

  const [editor] = useLexicalComposerContext();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const json = JSON.stringify(editorState.toJSON());
        onChange(json);
      }, 5000);
    })
  }, [editor, onChange])

  return null;
}