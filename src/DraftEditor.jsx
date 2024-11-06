"use client";

import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";
import Button from "@mui/material/Button";

const customStyleMap = {
  RED_LINE: { color: "red" },
  UNDERLINE: { textDecoration: "underline" },
};

export default function DraftEditor() {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("draftEditorContent");
    if (savedContent) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedContent))
      );
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    const content = editorState.getCurrentContent();
    if (!content.hasText()) {
      return;
    }
    localStorage.setItem(
      "draftEditorContent",
      JSON.stringify(convertToRaw(content))
    );
  }, [editorState]);

  const handleBeforeInput = (chars) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    const text = block.getText();

    if (chars === " " && text === "#") {
      const newContent = Modifier.replaceText(
        content,
        selection.merge({ anchorOffset: 0, focusOffset: 1 }),
        ""
      );
      const newEditorState = EditorState.push(
        editorState,
        newContent,
        "remove-range"
      );
      setEditorState(RichUtils.toggleBlockType(newEditorState, "header-one"));
      return "handled";
    } else if (chars === " " && text === "*") {
      const newContent = Modifier.replaceText(
        content,
        selection.merge({ anchorOffset: 0, focusOffset: 1 }),
        ""
      );
      let newEditorState = EditorState.push(
        editorState,
        newContent,
        "remove-range"
      );
      newEditorState = EditorState.setInlineStyleOverride(
        newEditorState,
        newEditorState.getCurrentInlineStyle().clear().add("BOLD")
      );
      setEditorState(newEditorState);
      return "handled";
    } else if (chars === " " && text === "**") {
      const newContent = Modifier.replaceText(
        content,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        ""
      );
      let newEditorState = EditorState.push(
        editorState,
        newContent,
        "remove-range"
      );
      newEditorState = EditorState.setInlineStyleOverride(
        newEditorState,
        newEditorState.getCurrentInlineStyle().clear().add("RED_LINE")
      );
      setEditorState(newEditorState);
      return "handled";
    } else if (chars === " " && text === "***") {
      const newContent = Modifier.replaceText(
        content,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 3,
        }),
        ""
      );
      let newEditorState = EditorState.push(
        editorState,
        newContent,
        "remove-range"
      );
      newEditorState = EditorState.setInlineStyleOverride(
        newEditorState,
        newEditorState.getCurrentInlineStyle().clear().add("UNDERLINE")
      );
      setEditorState(newEditorState);
      return "handled";
    }

    return "not-handled";
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleReturn = (e) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    const blockType = block.getType();

    if (blockType === "header-one") {
      const newContent = Modifier.splitBlock(content, selection);
      const newEditorState = EditorState.push(
        editorState,
        newContent,
        "split-block"
      );
      setEditorState(RichUtils.toggleBlockType(newEditorState, "unstyled"));
      return "handled";
    }

    return "not-handled";
  };

  const saveContent = () => {
    const content = editorState.getCurrentContent();
    const rawContent = JSON.stringify(convertToRaw(content));
    console.log(rawContent);
    localStorage.setItem("draftEditorContent", rawContent);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Demo By Navya Goyal</h1>
      <div style={styles.buttonContainer}>
        <Button variant="contained" color="primary" onClick={saveContent}>
          Save
        </Button>
      </div>
      <div style={styles.editorContainer}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          handleKeyCommand={handleKeyCommand}
          handleReturn={handleReturn}
          customStyleMap={customStyleMap}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "640px",
    margin: "0 auto",
    padding: "16px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  buttonContainer: {
    marginBottom: "16px",
  },
  editorContainer: {
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "16px",
    minHeight: "200px",
    transition: "all 0.2s ease",
    outline: "none",
  },
};
