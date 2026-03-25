import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, List, ListOrdered, Link2, Eraser } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!editorRef.current || isFocused) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, isFocused]);

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || "";
    onChange(html);
  };

  const handleLink = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    exec("createLink", url);
  };

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => exec("bold")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => exec("italic")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => exec("underline")}>
          <Underline className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => exec("insertUnorderedList")}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={handleLink}>
          <Link2 className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => exec("removeFormat")}>
          <Eraser className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      {placeholder && (
        <style>
          {`[contenteditable][data-placeholder]:empty:before { content: attr(data-placeholder); color: #9ca3af; }`}
        </style>
      )}
    </div>
  );
};

export default RichTextEditor;
