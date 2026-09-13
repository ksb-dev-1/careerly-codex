"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  List,
  ListOrdered,
  Redo,
  Undo,
} from "lucide-react";

type Props = {
  initialContent: string;
  onChange: (html: string) => void;
};

export function JobDescriptionEditor({ initialContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap gap-2 border-b p-2">
        {(
          [
            [1, Heading1],
            [2, Heading2],
            [3, Heading3],
            [4, Heading4],
          ] as const
        ).map(([level, Icon]) => (
          <button
            key={level}
            type="button"
            aria-label={`Heading ${level}`}
            title={`Heading ${level}`}
            className="rounded border p-2"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level }).run()
            }
          >
            <Icon aria-hidden="true" className="size-4" />
          </button>
        ))}
        <button
          type="button"
          aria-label="Bold"
          title="Bold"
          className="rounded border p-2"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Italic"
          title="Italic"
          className="rounded border p-2"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Bullet list"
          title="Bullet list"
          className="rounded border p-2"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Numbered list"
          title="Numbered list"
          className="rounded border p-2"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Undo"
          title="Undo"
          className="rounded border p-2"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Redo"
          title="Redo"
          className="rounded border p-2"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo aria-hidden="true" className="size-4" />
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="[&_.ProseMirror]:min-h-40 [&_.ProseMirror]:p-3 [&_.ProseMirror]:outline-none [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
      />
    </div>
  );
}
