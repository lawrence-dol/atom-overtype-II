# Overtype-Mode

Switch between insert and overtype mode by using `Insert` key. The cursor turns into a rectangle to indicate that
overtype is enabled. This package starts automatically and places a switch in the status-bar to choose between overwrite
and insert mode.

Note that on MacOS there is no `Insert` key, so on that OS the key-mapping to toggle insert/overwrite mode is
`CMD-SHIFT-DELETE`.

Aside some bug-fixes, this package includes some enhancements over the original "Atom Overtype Mode" to preserve
existing line structure. In overtype mode this package tries to avoid making changes to the layout of the document.

  - **Backspace** yields the caret one step to the left while overwriting the character with a SPACE-char. It doesn't drag the test right of the caret and it doesn't delete line breaks.
  - **Delete** replaces the char under the cursor with a SPACE and advances the caret to the right. It also doesn't delete line breaks.
  - **Enter** moves the curser to the start of the following-line without inserting a line break.
  - **Autocomplete** destructively overwrites as-many-chars-as-needed to the right of the caret.
  - Lastly, Backspace or Delete when text is selected will replace the text with spaces, again ignoring line breaks.

#### Contributions & Additions & Extensions

Contributions must be JavaScript and follow the general style of the existing code, **particularly the indentation of
closing braces to the same level as the block it terminates**.

Refer to the [Atom API](https://atom.io/docs/api/v1.35.1/TextEditor) for details about interacting with Atom.
