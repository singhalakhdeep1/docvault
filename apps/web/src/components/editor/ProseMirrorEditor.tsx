// ProseMirror editor component for docvault

'use client';

import { useEffect, useRef } from 'react';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, DOMParser as ProseMirrorDOMParser } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema as defaultSchema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';

interface ProseMirrorEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

export default function ProseMirrorEditor({
  content = '',
  onChange,
  placeholder = 'Start typing...',
}: ProseMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const schema = new Schema({
      nodes: defaultSchema.spec.nodes,
      marks: defaultSchema.spec.marks,
    });

    const state = EditorState.create({
      doc: DOMParser.fromSchema(schema).parse(
        new DOMParser().parseFromString(content || `<p>${placeholder}</p>`, 'text/html')
      ),
      plugins: [
        keymap(baseKeymap),
        exampleSetup({ schema }),
        new Plugin({
          props: {
            handleChange: (view: EditorView) => {
              if (onChange) {
                onChange(view.dom.innerHTML);
              }
            },
          },
        }),
      ],
    });

    const view = new EditorView(editorRef.current, {
      state,
      dispatchTransaction: (transaction) => {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        if (onChange) {
          onChange(view.dom.innerHTML);
        }
      },
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [content, onChange, placeholder]);

  return (
    <div className="prosemirror-editor">
      <div ref={editorRef} className="editor-content" />
    </div>
  );
}
