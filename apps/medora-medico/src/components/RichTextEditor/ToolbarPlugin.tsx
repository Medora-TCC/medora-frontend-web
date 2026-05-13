import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $isHeadingNode,
  type HeadingTagType,
} from "@lexical/rich-text";
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
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      type="button"
      aria-pressed={active}
      className={[
        "flex items-center justify-center w-8 h-8 rounded-md",
        "transition-all duration-150 cursor-pointer select-none",
        "text-sm font-medium focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-indigo-500",
        active
          ? "bg-indigo-100 text-indigo-700 shadow-inner"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
 
function Separator() {
  return (
    <div
      role="separator"
      className="w-px h-5 bg-slate-200 mx-1 self-center rounded-full"
    />
  );
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
    const element =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
 
    if ($isListNode(element)) {
      const listType = element.getListType();
      setBlockType(listType === "bullet" ? "bullet" : "number");
    } else {
      const parentList = $getNearestNodeOfType(anchorNode, ListNode);
      if (parentList) {
        const listType = parentList.getListType();
        setBlockType(listType === "bullet" ? "bullet" : "number");
      } else if ($isHeadingNode(element)) {
        setBlockType(element.getTag() as BlockType);
      } else {
        setBlockType("paragraph");
      }
    }

    const fmt = (element as any).__format ?? 0;
    if (fmt === 2) setAlignment("center");
    else if (fmt === 3) setAlignment("right");
    else setAlignment("left");
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
 
  const formatBold = () =>
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
 
  const formatUnderline = () =>
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
 
  const formatStrikethrough = () =>
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
 
  const formatHeading = (tag: HeadingTagType | "paragraph") => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (tag === "paragraph") {
        $setBlocksType(selection, () => $createParagraphNode());
      } else {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };
 
  const toggleList = (type: "bullet" | "number") => {
    if (blockType === type) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(
        type === "bullet"
          ? INSERT_UNORDERED_LIST_COMMAND
          : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      );
    }
  };

  const formatAlign = (align: Alignment) =>
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align);

  return (
    <div
      role="toolbar"
      aria-label="Opções de formatação"
      className="flex h-fit items-center gap-0.5 px-2 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm w-fit absolute"
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
 
      <ToolbarButton
        onClick={() => blockType === "h1" ? formatHeading("paragraph") : formatHeading("h1")}
        active={blockType === "h1"}
        title="Cabeçalho 1"
      >
        <Heading1 size={15} strokeWidth={2} />
      </ToolbarButton>
 
      <ToolbarButton
        onClick={() => blockType === "h2" ? formatHeading("paragraph") : formatHeading("h2")}
        active={blockType === "h2"}
        title="Cabeçalho 2"
      >
        <Heading2 size={15} strokeWidth={2} />
      </ToolbarButton>
 
      <ToolbarButton
        onClick={() => blockType === "h3" ? formatHeading("paragraph") : formatHeading("h3")}
        active={blockType === "h3"}
        title="Cabeçalho 3"
      >
        <Heading3 size={15} strokeWidth={2} />
      </ToolbarButton>
 
      <ToolbarButton
        onClick={() => formatHeading("paragraph")}
        active={blockType === "paragraph"}
        title="Parágrafo normal"
      >
        <Pilcrow size={15} strokeWidth={2} />
      </ToolbarButton>
 
      <Separator />
 
      <ToolbarButton
        onClick={() => toggleList("bullet")}
        active={blockType === "bullet"}
        title="Lista não ordenada"
      >
        <List size={15} strokeWidth={2} />
      </ToolbarButton>
 
      <ToolbarButton
        onClick={() => toggleList("number")}
        active={blockType === "number"}
        title="Lista ordenada"
      >
        <ListOrdered size={15} strokeWidth={2} />
      </ToolbarButton>
 
      <Separator />
 
      <ToolbarButton
        onClick={() => formatAlign("left")}
        active={alignment === "left"}
        title="Alinhar à esquerda"
      >
        <AlignLeft size={15} strokeWidth={2} />
      </ToolbarButton>
 
      <ToolbarButton
        onClick={() => formatAlign("center")}
        active={alignment === "center"}
        title="Centralizar"
      >
        <AlignCenter size={15} strokeWidth={2} />
      </ToolbarButton>
 
      <ToolbarButton
        onClick={() => formatAlign("right")}
        active={alignment === "right"}
        title="Alinhar à direita"
      >
        <AlignRight size={15} strokeWidth={2} />
      </ToolbarButton>
    </div>
  );
}
