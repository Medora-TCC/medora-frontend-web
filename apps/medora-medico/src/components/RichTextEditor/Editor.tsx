import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode } from "@lexical/rich-text";
import type { JSX } from "react";
import { ToolbarPlugin } from "./ToolbarPlugin";

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

export function Editor(): JSX.Element {
  const initialConfig = {
    namespace: "EditorProntuario",
    theme: theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="flex h-full border border-slate-200 rounded-2xl overflow-hidden shadow-sm mx-4">
        <ToolbarPlugin />
        <div className=" h-full w-full overflow-y-scroll">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="h-full p-4 outline-none bg-white text-slate-800 overflow-y-scroll" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-slate-400 pointer-events-none">
                Comece a escrever…
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
