let log = console.log;

let exported=module.exports={};

// *********************************************************************************************************************
// EXPORTED FUNCTIONS
// *********************************************************************************************************************

exported.duplicateLines = function() {
    var editor;
    if (!(editor = this.active())) {
        this.log("duplicateLines -> .insertNewlineBelow");
        return this.activeEditor().insertNewlineBelow();
        }
    this.log("duplicateLines editor='" + editor.id + "'");
    return editor.duplicateLines();
    };

exported.pasteSpecial = function() {
    var bufferLineCount, clipboardText, column, currentLine, editor, end, error, idx, j, lastLine, lastLineIdx, leftPrefix, len1, lineEnding, lines, newLine, newLines, oldLine, pristineBuffer, ref, row, spaces, targetRange;
    this.log("pasteSpecial starts");
    clipboardText = atom.clipboard.read();
    if (clipboardText.length === 0) {
        return;
        }
    lineEnding = this.getLineEnding();
    lines = clipboardText.split(lineEnding);
    if (lines.length === 0) {
        this.log("pasteSpecial no-content", 1);
        return;
        }
    editor = this.activeEditor();
    ref = editor.getCursorBufferPosition(), row = ref.row, column = ref.column;
    if (column === 0) {
        newLines = lines;
        }
    else {
        bufferLineCount = editor.getLineCount();
        newLines = [];
        for (idx = j = 0, len1 = lines.length; j < len1; idx = ++j) {
            newLine = lines[idx];
            currentLine = row + idx;
            if (currentLine >= bufferLineCount) {
                oldLine = ' '.repeat(column);
                }
            else {
                oldLine = editor.lineTextForBufferRow(currentLine);
                }
            leftPrefix = oldLine.slice(0, column);
            if (leftPrefix.length < column) {
                spaces = ' '.repeat(column - leftPrefix.length);
                leftPrefix += spaces;
                }
            newLines.push(leftPrefix + newLine);
            }
        }
    try {
        pristineBuffer = editor.createCheckpoint();
        lastLineIdx = row + newLines.length - 1;
        lastLine = editor.lineTextForBufferRow(lastLineIdx);
        targetRange = [[row, 0], [lastLineIdx, lastLine.length]];
        end = editor.setTextInBufferRange(targetRange, newLines.join(lineEnding)).end;
        editor.setCursorBufferPosition(end);
        editor.groupChangesSinceCheckpoint(pristineBuffer);
        return this.log('pasteSpecial:: finished without error.', 1);
        }
    catch (error1) {
        error = error1;
        this.log("pasteSpecial:: error was " + error, 3);
        return editor.revertToCheckpoint(pristineBuffer);
        }
    };

exported.backspace2col0 = function() {
    var column, editor, error, newRange, newText, pristineBuffer, ref, row;
    if (!(editor = this.active())) {
        return this.activeEditor().deleteToBeginningOfLine();
        }
    try {
        pristineBuffer = editor.createCheckpoint();
        ref = editor.getCursorBufferPosition(), row = ref.row, column = ref.column;
        newRange = [[row, 0], [row, column]];
        newText = ' '.repeat(column);
        editor.setTextInBufferRange(newRange, newText);
        editor.setCursorBufferPosition([row, 0]);
        return editor.groupChangesSinceCheckpoint(pristineBuffer);
        }
    catch (error1) {
        error = error1;
        this.log("backspace2col0:: had error: '" + error + "'", 3);
        return editor.revertToCheckpoint(pristineBuffer);
        }
    };

exported.backspace2lastcol = function() {
    var column, editor, error, lineLen, newRange, newText, pristineBuffer, ref, row;
    if (!(editor = this.active())) {
        return this.activeEditor().deleteToEndOfLine();
        }
    this.log("backspace2lastcol:: start");
    try {
        pristineBuffer = editor.createCheckpoint();
        ref = editor.getCursorBufferPosition(), row = ref.row, column = ref.column;
        lineLen = editor.lineTextForBufferRow(row).length;
        newRange = [[row, column], [row, lineLen]];
        newText = ' '.repeat(lineLen - column);
        return editor.setTextInBufferRange(newRange, newText);
        }
    catch (error1) {
        error = error1;
        this.log("backspace2lastcol:: had error: '" + error + "'", 3);
        return editor.revertToCheckpoint(pristineBuffer);
        }
    };

exported.enter = function() {
    var cursor, cursorPos, editor, lastRow;
    if (!((editor = this.active()) || (false === this.cfg('Keypress.keyReturn')))) {
        return this.activeEditor().pristine_insertNewline();
        }
    cursor = editor.getLastCursor();
    lastRow = editor.getLastBufferRow();
    cursorPos = cursor.getBufferPosition();
    if (cursorPos.row === lastRow) {
        cursor.moveToEndOfLine();
        return editor.pristine_insertNewline();
        }
    else {
        cursor.moveDown();
        return cursor.moveToFirstCharacterOfLine();
        }
    };

exported.backspace = function() {
    return this.activeEditor().backspace();
    }
//exported.backspace = function() {
//    var editor;
//    if (!((editor = this.active()) || (false === this.cfg('Keypress.keyBackspace')))) {
//        return this.activeEditor().backspace();
//        }
//    return editor.mutateSelectedText((function(_this) {
//        return function(sel, idx) {
//            var char, cursor, range;
//            if (sel.isEmpty()) {
//                cursor = sel.cursor;
//                range = cursor.getBufferPosition();
//                char = sel.editor.getTextInBufferRange(range);
//                _this.log("backspace char='" + char + "'");
//                if (cursor.isAtBeginningOfLine()) {
//                    cursor.moveLeft();
//                    }
//                sel.selectLeft();
//                sel.insertText(' ');
//                return cursor.moveLeft();
//                }
//            else {
//                return overwriteSelection(sel);
//                }
//            };
//        })(this));
//    };

exported.delete = function() {
    return this.activeEditor()["delete"]();
    }
//exported.delete = function() {
//    var editor;
//    if (!((editor = this.active()) || (false === this.cfg('Keypress.keyDelete')))) {
//        return this.activeEditor()["delete"]();
//        }
//    return editor.mutateSelectedText((function(_this) {
//        return function(sel, idx) {
//            var char, col, cur, range;
//            if (!sel.isEmpty()) {
//                return overwriteSelection(sel);
//                }
//            cur = sel.cursor;
//            col = cur.getBufferColumn();
//            char = cur.getCurrentBufferLine()[col];
//            if (char != null) {
//                sel["delete"]();
//                }
//            if (!editor.hasMultipleCursors()) {
//                _this.log("delete mode=single char='" + char + "'");
//                if (_this.cfg('Keypress.keyDeleteSpace')) {
//                    if (char === ' ') {
//                        return;
//                        }
//                    }
//                }
//            range = sel.getBufferRange();
//            _this.log("delete inserts ' ' range=" + range);
//            editor.setTextInBufferRange(range, ' ');
//            return sel.cursor.moveLeft();
//            };
//        })(this));
//    };

function myClipboard(lineEnding) {
    var cb;
    cb = {
        text: atom.clipboard.read(),
        size: 0,
        lines: [],
        };
    cb.size = cb.text.length;
    cb.lines = cb.text.split(lineEnding);
    log(cb.lines.length + "-rows out of chars=" + cb.size);
    return cb;
    };

exported.peekForVerticalPaste = function(editor) {
    var bufferLineCount, cid, clipBoard, currentLine, cursorColumn, cursorPoint, cursorRow, idx, j, k, leftPrefix, len1, len2, newLine, newLines, oldLine, pasteLines, ref, ref1, spaces;
    clipBoard = myClipboard(this.getLineEnding());
    if (clipBoard.size === 0) {
        return;
        }
    pasteLines = [];
    ref = editor.getCursorBufferPositions();
    for (cid = j = 0, len1 = ref.length; j < len1; cid = ++j) {
        cursorPoint = ref[cid];
        cursorRow = cursorPoint.row, cursorColumn = cursorPoint.column;
        if (cursorColumn === 0) {
            pasteLines.push(clipBoard.lines);
            continue;
            }
        newLines = [];
        bufferLineCount = editor.getLineCount();
        ref1 = clipBoard.lines;
        for (idx = k = 0, len2 = ref1.length; k < len2; idx = ++k) {
            newLine = ref1[idx];
            currentLine = cursorRow + idx;
            if (currentLine >= bufferLineCount) {
                oldLine = ' '.repeat(cursorColumn);
                }
            else {
                oldLine = editor.lineTextForBufferRow(currentLine);
                }
            leftPrefix = oldLine.slice(0, cursorColumn);
            if (leftPrefix.length < cursorColumn) {
                spaces = ' '.repeat(cursorColumn - leftPrefix.length);
                leftPrefix += spaces;
                }
            newLines.push(leftPrefix + newLine);
            }
        pasteLines.push(newLines);
        }
    this.log("finished " + cid + " x cursor-positions.");
    return pasteLines.map(function(arr, i) {
        return this.log("\t" + i + ". " + arr.length + " x rows.");
        });
    };

exported.peekBeforePaste = function() {
    var clipBoard, editor;
    editor = this.active();
    if (editor) {
        return this.peekForVerticalPaste(editor);
        }
    editor = this.activeEditor();
    clipBoard = splitClipboard(this.getLineEnding());
    if (clipBoard.size === 0) {
        return;
        }
    return editor.mutateSelectedText((function(_this) {
        return function(sel, idx) {
            var selLen, start;
            _this.log("peekForPaste:: selection-" + idx);
            if (!sel.isEmpty()) {
                sel.clear();
                start = sel.getBufferRange().start;
                selLen = sel.getText().length;
                _this.log("selecion-length is " + selLen);
                sel.setBufferRange({
                    start: start,
                    end: start
                    });
                }
            return sel.selectRight(clipBoard.size);
            };
        })(this));
    };

exported.paste = function() {
    var clipboardText, cursor, editor, rc_pos, single;
    if (!((editor = this.active()) || (false === this.cfg('Keypress.keyPaste')))) {
        return this.activeEditor().pasteText();
        }
    clipboardText = atom.clipboard.read();
    single = clipboardText.includes(this.getLineEnding());
    if (clipboardText.length === 0) {
        return;
        }
    cursor = editor.getLastCursor();
    rc_pos = cursor.getScreenPosition();
    editor.selectRight(clipboardText.length);
    editor.insertText(clipboardText);
    this.log("it's paste stupid");
    return cursor.setScreenPosition(rc_pos);
    };

exported.smartInsert = function() {
    var column, editor, getIndent, hasSpacedArea, hasStructure, nonWord, ref, row, scope, sim;
    getIndent = function(line) {
        var spaces;
        try {
            spaces = /^ +/.exec(line)[0];
            return spaces.length;
            }
        catch (error1) {}
        return 0;
        };
    hasSpacedArea = function(line, start) {
        var areas, c, char, end, indent;
        if (start == null) {
            start = 0;
            }
        indent = getIndent(line);
        areas = [[indent, line.length, line]];
        if (start < indent) {
            start = indent;
            }
        end = line.length;
        c = 0;
        while (start !== end) {
            char = line[start];
            this.log("smartInsert:: start=" + start + " char='" + char + "' c=" + c);
            if (char == null) {
                break;
                }
            if (char === ' ') {
                c++;
                }
            else {
                if (c > 1) {
                    areas.push({
                        s: start - c,
                        e: start,
                        b: char
                        });
                    }
                c = 0;
                }
            start++;
            }
        this.log("hasSpacedArea:: ends with start=" + start);
        return areas;
        };
    hasStructure = function(editor, bufferRow) {
        var a1, a2, a3, above, below, isChar, isDelim, line, similar, truth;
        isChar = function(char) {
            return /[a-zA-Z@]/.test(char);
            };
        isDelim = function(char) {
            return /[\(\)"'\{\}\[\]+-]/.test(char);
            };
        similar = function(row1, row2) {
            var area, b1, b2, e1, e2, i, j, l1, l1Indent, l1Len, l2, l2Indent, l2Len, len1, line1, line2, ref, ref1, ref2, ref3, s1, s2, truth;
            l1 = row1.slice(0);
            l2 = row2.slice(0);
            ref = l1.shift(), l1Indent = ref[0], l1Len = ref[1], line1 = ref[2];
            ref1 = l2.shift(), l2Indent = ref1[0], l2Len = ref1[1], line2 = ref1[2];
            if (l1Indent !== l2Indent) {
                return false;
                }
            truth = false;
            if (!l1.length) {
                if (l2.length > 0) {
                    ref2 = [l2, l1], l1 = ref2[0], l2 = ref2[1];
                    }
                }
            for (i = j = 0, len1 = l1.length; j < len1; i = ++j) {
                area = l1[i];
                s1 = area.s, e1 = area.e, b1 = area.b;
                if (l2[i] == null) {
                    if (b1 === line2[e1]) {
                        return true;
                        }
                    }
                else {
                    ref3 = l2[i], s2 = ref3.s, e2 = ref3.e, b2 = ref3.b;
                    if (e1 !== e2) {
                        continue;
                        }
                    if (b1 !== b2) {
                        return false;
                        }
                    if ((b1 === b2) && (e1 === e2)) {
                        truth = true;
                        }
                    }
                }
            return truth;
            };
        truth = [];
        line = editor.lineTextForBufferRow(bufferRow);
        a1 = hasSpacedArea(line);
        above = editor.lineTextForBufferRow(bufferRow - 1);
        a2 = hasSpacedArea(above);
        log(line);
        log(above);
        log("------");
        log(a1);
        log(a2);
        truth.push(similar(a1, a2));
        below = editor.lineTextForBufferRow(bufferRow + 1);
        a3 = hasSpacedArea(below);
        truth.push(similar(a1, a3));
        return truth;
        };
    editor = this.activeEditor();
    ref = editor.getCursorBufferPosition(), row = ref.row, column = ref.column;
    this.log(hasStructure(editor, row));
    return;
    sim = function(l1, l2) {
        var len, r;
        l1 = l1.split('');
        l2 = l2.split('');
        len = Math.min(l1.length, l2.length);
        this.log("sim:: length is " + len);
        r = new Array(len).fill(false);
        r.map(function(e, idx) {
            if (l1[idx] !== ' ') {
                return;
                }
            if (l1[idx] === l2[idx]) {
                return r[idx] = l1[idx];
                }
            });
        this.log("sim:: result is r='" + r + "'");
        return r;
        };
    scope = editor.getRootScopeDescriptor().scopes[0];
    console.log("scope is", scope);
    nonWord = atom.config.get('editor.nonWordCharacters');
    return console.log("non-word ", nonWord);
    };

// *********************************************************************************************************************
// PRIVATE FUNCTIONS
// *********************************************************************************************************************

//function overwriteSelection(sel, caretPos, keepSelection) {
//    var range, space, text;
//    if (caretPos == null) {
//        caretPos = 'start';
//        }
//    if (keepSelection == null) {
//        keepSelection = true;
//        }
//    text = sel.getText();
//    space = ' '.repeat(text.length);
//    range = sel.getBufferRange();
//    sel.insertText(space);
//    sel.setBufferRange({
//        start: range[caretPos],
//        end: range[caretPos]
//        });
//    if (!keepSelection) {
//        return sel.clear();
//        }
//    };
