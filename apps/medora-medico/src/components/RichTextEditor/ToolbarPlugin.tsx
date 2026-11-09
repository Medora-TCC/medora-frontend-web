import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $isHeadingNode, type HeadingTagType } from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  Bold,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
} from "lucide-react";

type BlockType = "h1" | "h2" | "h3" | "paragraph" | "bullet" | "number";
type Alignment = "left" | "center" | "right";

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active = false, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      // mouseDown não rouba o foco do editor (a seleção continua); o clique cuida de mouse E teclado.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={[
        "flex size-7 shrink-0 cursor-pointer select-none items-center justify-center rounded-md",
        "transition-colors duration-150 motion-reduce:transition-none focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary-color",
        active
          ? "bg-primary-subtle text-primary-text"
          : "text-text-secondary hover:bg-surface-alt hover:text-text-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div role="separator" aria-orientation="vertical" className="mx-1 h-4 w-px shrink-0 self-center bg-border" />;
}

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [blockType, setBlockType] = useState<BlockType>("paragraph");
  const [alignment, setAlignment] = useState<Alignment>("left");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    setIsBold(selection.hasFormat("bold"));
    setIsUnderline(selection.hasFormat("underline"));
    setIsStrikethrough(selection.hasFormat("strikethrough"));

    const anchorNode = selection.anchor.getNode();
    const element = anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();

    if ($isListNode(element)) {
      setBlockType(element.getListType() === "bullet" ? "bullet" : "number");
    } else {
      const parentList = $getNearestNodeOfType(anchorNode, ListNode);
      if (parentList) {
        setBlockType(parentList.getListType() === "bullet" ? "bullet" : "number");
      } else if ($isHeadingNode(element)) {
        setBlockType(element.getTag() as BlockType);
      } else {
        setBlockType("paragraph");
      }
    }

    // API pública em vez de ler `__format` (campo privado do Lexical).
    const format = $isElementNode(element) ? element.getFormatType() : "left";
    setAlignment(format === "center" ? "center" : format === "right" || format === "end" ? "right" : "left");
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateToolbar);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor, updateToolbar]);

  const formatBold = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  const formatUnderline = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  const formatStrikethrough = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");

  const formatHeading = (tag: HeadingTagType | "paragraph") => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => (tag === "paragraph" ? $createParagraphNode() : $createHeadingNode(tag)));
    });
  };

  const toggleHeading = (tag: HeadingTagType) => formatHeading(blockType === tag ? "paragraph" : tag);

  const toggleList = (type: "bullet" | "number") => {
    if (blockType === type) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(
        type === "bullet" ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      );
    }
  };

  const formatAlign = (align: Alignment) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align);

  return (
    <div
      role="toolbar"
      aria-label="Opções de formatação"
      // Faixa fina colada no topo do editor; em telas estreitas rola na horizontal em vez de quebrar linha.
      className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-border bg-surface px-1.5 py-1"
    >
      <ToolbarButton onClick={formatBold} active={isBold} title="Negrito (Ctrl+B)">
        <Bold size={15} strokeWidth={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={formatUnderline} active={isUnderline} title="Sublinhado (Ctrl+U)">
        <Underline size={15} strokeWidth={2.5} />
      </ToolbarButton>
      <ToolbarButton onClick={formatStrikethrough} active={isStrikethrough} title="Tachado">
        <Strikethrough size={15} strokeWidth={2.5} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton onClick={() => toggleHeading("h1")} active={blockType === "h1"} title="Título 1">
        <Heading1 size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => toggleHeading("h2")} active={blockType === "h2"} title="Título 2">
        <Heading2 size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => toggleHeading("h3")} active={blockType === "h3"} title="Título 3">
        <Heading3 size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatHeading("paragraph")} active={blockType === "paragraph"} title="Parágrafo normal">
        <Pilcrow size={15} strokeWidth={2} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton onClick={() => toggleList("bullet")} active={blockType === "bullet"} title="Lista com marcadores">
        <List size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => toggleList("number")} active={blockType === "number"} title="Lista numerada">
        <ListOrdered size={15} strokeWidth={2} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton onClick={() => formatAlign("left")} active={alignment === "left"} title="Alinhar à esquerda">
        <AlignLeft size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatAlign("center")} active={alignment === "center"} title="Centralizar">
        <AlignCenter size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatAlign("right")} active={alignment === "right"} title="Alinhar à direita">
        <AlignRight size={15} strokeWidth={2} />
      </ToolbarButton>
    </div>
  );
}