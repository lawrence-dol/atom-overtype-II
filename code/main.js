let CompositeDisposable     = require('atom').CompositeDisposable
,   actions                 = require('./actions')
,   pkg                     = require('../package.json');

let action, cmd;

let OvertypeMode = (function() {
    let conFncName          = [ 'debug', 'log', 'info', 'warn', 'error' ];

    function deepDiff(oldV, newV, path, diff) {
        var key, msg, val;

        if(path == null) { path = []; }
        if(diff == null) { diff = {}; }

        for(key in newV) {
            val = newV[key];
            if (typeof val === 'object') {
                path.push(key);
                diff = deepDiff(oldV[key], newV[key], path, diff);
                path.pop();
                }
            else {
                if (oldV[key] !== val) {
                    path.push(key);
                    return {
                        key: path.join('.'),
                        old: oldV[key],
                        "new": val
                        };
                    }
                }
            }
        return diff;
        };

    function OvertypeMode() {
        this.onType = this.onType.bind(this);
        }

    OvertypeMode.prototype.logLevel     = 4;
    OvertypeMode.prototype.levelNames   = [];
    OvertypeMode.prototype.statusBar    = null;
    OvertypeMode.prototype.minComplete  = atom.config.get('autocomplete-plus.minimumWordLength');
    OvertypeMode.prototype.cmds         = new CompositeDisposable();
    OvertypeMode.prototype.events       = new CompositeDisposable();
    OvertypeMode.prototype.config       = require('./config.coffee');
    OvertypeMode.prototype.caretClass   = 'overtype-cursor';
    OvertypeMode.prototype.enabledEd    = new Set();

    OvertypeMode.prototype.gcEditors = function() {
        var i, id, ids, len, ref, results, workSpace;
        workSpace = atom.workspace;

        ids = workSpace.getTextEditors().map(function(e) {
            return e.id;
            });
        ref = Array.from(this.enabledEd);
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
            id = ref[i];
            if (ids.indexOf(id) < 0) {
                results.push(this.enabledEd["delete"](id));
                }
            else {
                results.push(void 0);
                }
            }
        return results;
        };

    OvertypeMode.prototype.active = function(editor) {
        if (editor == null) {
            editor = this.activeEditor();
            if (editor == null) {
                return;
                }
            }
        if (this.enabledEd.has(editor.id)) {
            return editor;
            }
        };

    OvertypeMode.prototype.notify = function(theMsg, level) {
        var levelName, msg;
        if (level == null) {
            level = 0;
            }
        msg = [pkg.name, ':', Date.now(), ': ', theMsg].join('');
        if ((level === 4) || this.cfg('Package.debug')) {
            console[conFncName[level]](msg);
            }
        if (!(level >= this.logLevel)) {
            return;
            }
        levelName = this.levelNames[level];
        console.log("levelName '" + levelName + "'", levelName, level);
        return atom.notifications['add' + levelName](msg);
        };

    OvertypeMode.prototype.log = function(msg, lvl) {
        return this.notify(msg, lvl);
        };

    OvertypeMode.prototype.settingsObserver = function(option) {
        var keyPath, msg, pkgName;
        option.key = option.key.split('.');
        switch (option.key.shift()) {
            case 'Package':
                switch (option.key.shift()) {
                    case 'showIndicator':
                        if (option["new"] === 'no') {
                            return this.sbItem.classList.add('hide-indicator');
                            }
                        else {
                            return this.consumeStatusBar(this.statusBar);
                            }
                        break;
                    case 'changeCaretStyle':
                        return this.updateCursorStyles();
                    case 'debug':
                        this.notify("logging to dev-tools-console = " + option["new"], 1);
                        if (option["new"]) {
                            return atom.confirm({
                                message: 'Open DevTools-console ?',
                                buttons: {
                                    Yes: function() {
                                        return atom.openDevTools();
                                        },
                                    No: function() {}
                                    }
                                });
                            }
                        break;
                    case 'notificationLevel':
                        this.logLevel = OvertypeMode.levelNames.indexOf(option["new"]);
                        msg = "setting:: " + option.key + " was '" + option.old + "' now '" + option["new"] + "' => " + this.logLevel;
                        return this.log(msg, 1);
                    }
                break;
            case 'Others':
                switch (option.key.shift()) {
                    case 'editor':
                        switch (option.key.shift()) {
                            case 'autoIndent':
                                keyPath = 'editor.autoIndent';
                                return atom.config.set(keyPath, option["new"]);
                            case 'atomicSoftTabs':
                                keyPath = 'editor.atomicSoftTabs';
                                return atom.config.set(keyPath, option["new"]);
                            case 'autoIndentOnPaste':
                                keyPath = 'editor.autoIndentOnPaste';
                                return atom.config.set(keyPath, option["new"]);
                            }
                        break;
                    case 'autocompletePlus':
                        switch (option.key.shift()) {
                            case 'strictMatching':
                            keyPath = 'autocomplete-plus.strictMatching';
                            return atom.config.set(keyPath, option["new"]);
                            case 'minimumWordLength':
                            keyPath = 'autocomplete-plus.minimumWordLength';
                            return atom.config.set(keyPath, option["new"]);
                            }
                        break;
                    case 'bracketMatcher':
                        switch (option.key.shift()) {
                            case 'alwaysSkipClosingPairs':
                            keyPath = 'bracket-matcher.alwaysSkipClosingPairs';
                            return atom.config.set(keyPath, option["new"]);
                            case 'singleCharFilter':
                            return this.notify('SingleChar-Filter disabled.', 3);
                            }
                        break;
                    case 'autocompleteSnippets':
                        pkgName = 'autocomplete-snippets';
                        if (option["new"] === true) {
                            if (atom.packages.isPackageActive(pkgName)) {
                                atom.packages.disablePackage(pkgName);
                                }
                            }
                        else {
                            if (atom.packages.isPackageActive(pkgName)) {
                                return;
                                }
                            atom.packages.enablePackage(pkgName);
                            }
                        return this.log("package 'autocomplete-snippets' is " + option["new"]);
                    }
                break;
            default:
                return this.log("no action for '" + option.key + "'-section yet.");
            }
        };

    OvertypeMode.prototype.activate = function(state) {
        var cmd, keyPath, method, ref, schema;

        keyPath = 'Package.notificationLevel';
        schema = atom.config.getSchema([pkg.name, keyPath].join('.'));
        OvertypeMode.levelNames = schema["enum"];
        this.levelNames = schema["enum"];
        this.logLevel = schema["enum"].indexOf(this.cfg(keyPath));
        this.log('activate::starts');
        this.events.add(atom.config.onDidChange(pkg.name, (function(_this) {
            return function(arg) {
                var newValue, oldValue, option;
                oldValue = arg.oldValue, newValue = arg.newValue;
                option = deepDiff(oldValue, newValue);
                _this.log("config-change was: '" + (Object.values(option)) + "'", 1);
                return _this.settingsObserver(option);
                };
            })(this)));
        ref = {
            toggle: (function(_this) {
                return function() {
                    return _this.toggle();
                    };
                })(this),
            "delete": (function(_this) {
                return function() {
                    return _this["delete"]();
                    };
                })(this),
            backspace: (function(_this) {
                return function() {
                    return _this.backspace();
                    };
                })(this),
            paste: (function(_this) {
                return function() {
                    return _this.paste();
                    };
                })(this),
            duplicateLines: (function(_this) {
                return function() {
                    return _this.duplicateLines();
                    };
                })(this),
            pasteSpecial: (function(_this) {
                return function() {
                    return _this.pasteSpecial();
                    };
                })(this),
            smartInsert: (function(_this) {
                return function() {
                    return _this.smartInsert();
                    };
                })(this),
            backspace2col0: (function(_this) {
                return function() {
                    return _this.backspace2col0();
                    };
                })(this),
            backspace2lastcol: (function(_this) {
                return function() {
                    return _this.backspace2lastcol();
                    };
                })(this),
            peekBeforePaste: (function(_this) {
                return function() {
                    return _this.peekBeforePaste();
                    };
                })(this)
            };
        for(cmd in ref) {
            method = ref[cmd];
            this.cmds.add(atom.commands.add('atom-text-editor', 'overtype-mode:' + cmd, method));
            }
        this.events.add(atom.workspace.observeTextEditors((function(_this) {
            return function(editor) {
                _this.log("observe:: new TextEditor id=" + editor.id);
                return _this.prepareEditor(editor);
                };
            })(this)));
        return this.events.add(atom.workspace.onDidChangeActiveTextEditor((function(_this) {
            return function(editor) {
                if (editor == null) {
                    return;
                    }
                _this.log("onDidChangeActiveTextEditor is id=" + editor.id);
                if (_this.cfg('Package.changeCaretStyle')) {
                    _this.updateCursorStyle(editor);
                    }
                if (_this.active(editor)) {
                    _this.enable();
                    }
                else {
                    _this.disable();
                    }
                return _this.gcEditors();
                };
            })(this)));
        };

    OvertypeMode.prototype.cfg = function(key) {
        return atom.config.get([pkg.name, key].join('.'));
        };

    OvertypeMode.prototype.activeEditor = function() {
        return atom.workspace.getActiveTextEditor();
        };

    OvertypeMode.prototype.consumeStatusBar = function(statusBar) {
        this.statusBar = statusBar;
        this.setupIndicator();
        if ('overwrite' === this.cfg('Package.startMode')) {
            return this.enable();
            }
        };

    OvertypeMode.prototype.getLineEnding = function() {
        var codes, i, len, lineEnding, ref, ref1, ref2, ref3, tile, tiles;
        codes = {
            'LF': '\n',
            'CRLF': '\r\n'
            };
        tiles = this.statusBar.getRightTiles();
        ref = tiles.concat(this.statusBar.getLeftTiles());
        for (i = 0, len = ref.length; i < len; i++) {
            tile = ref[i];
            if (!((ref1 = tile.item) != null ? (ref2 = ref1.element) != null ? (ref3 = ref2.classList) != null ? ref3.contains('line-ending-tile') : void 0 : void 0 : void 0)) {
                continue;
                }
            lineEnding = tile.item.element.text;
            break;
            }
        this.log("getLineEnding returns '" + lineEnding + "'", 1);
        return codes[lineEnding || 'LF'];
        };

    OvertypeMode.prototype.setupIndicator = function() {
        if (this.sbItem == null) {
            this.sbItem = document.createElement('div');
            this.sbItem.classList.add('inline-block');
            this.sbItem.classList.add('mode-insert');
            this.sbItem.textContent = 'Insert';
            this.sbItem.addEventListener('click', (function(_this) {
                return function() {
                    return _this.toggle();
                    };
                })(this));
            this.sbTooltip = atom.tooltips.add(this.sbItem, {
                title: 'Mode: Insert'
                });
            }
        if (this.sbTile != null) {
            this.sbTile.destroy();
            }
        this.log("setupIndicator cfg = '" + (this.cfg('Package.showIndicator')) + "'", 1);
        switch (this.cfg('Package.showIndicator')) {
            case 'left':
                this.sbItem.classList.remove('hide-indicator');
                return this.sbTile = this.statusBar.addLeftTile({
                    item: this.sbItem,
                    priority: 50
                    });
            case 'right':
                this.sbItem.classList.remove('hide-indicator');
                return this.sbTile = this.statusBar.addRightTile({
                    item: this.sbItem,
                    priority: 50
                    });
            case 'no':
                return this.sbItem.classList.add('hide-indicator');
            }
        };

    OvertypeMode.prototype.deactivate = function() {
        var ref;
        this.log("deactivate:: starts", 1);
        this.disable();
        this.events.dispose();
        this.cmds.dispose();
        if ((ref = this.sbTile) != null) {
            ref.destroy();
            }
        if (this.sbItem != null) {
            this.sbItem = null;
            }
        atom.workspace.getTextEditors().map(function(editor) {
            if (editor.pristine_insertNewline != null) {
                editor.enter = editor.pristine_insertNewline;
                return editor.pristine_insertNewline = null;
                }
            });
        this.enabledEd.clear();
        return this.log("deactivate:: ends", 1);
        };

    OvertypeMode.prototype.toggle = function() {
        var editor;
        if (!(editor = this.activeEditor())) {
            return;
            }
        this.log("toggle:: starts editor.id " + editor.id, 1);
        if (this.active(editor)) {
            this.enabledEd["delete"](editor.id);
            this.disable();
            }
        else {
            this.enabledEd.add(editor.id);
            this.enable();
            }
        if (this.cfg('Package.changeCaretStyle')) {
            this.updateCursorStyles();
            }
        return this.log("toggle:: editoren=" + this.enabledEd.size + " ids=" + (Array.from(this.enabledEd)), 1);
        };

    OvertypeMode.prototype.enable = function() {
        this.log("enable:: starts");
        if ('no' === this.cfg('Package.showIndicator')) {
            return;
            }
        this.sbTooltip = atom.tooltips.add(this.sbItem, {
            title: 'Mode: Overwrite'
            });
        this.sbItem.textContent = 'Over';
        if (this.hidden) {
            this.sbItem.classList.remove('hide-indictator');
            }
        this.sbItem.classList.remove('mode-insert');
        this.sbItem.classList.add('mode-overwrite');
        return this.log("enable:: ends");
        };

    OvertypeMode.prototype.disable = function() {
        this.log("disable:: starts");
        if ('no' === this.cfg('Package.showIndicator')) {
            return;
            }
        this.sbTooltip = atom.tooltips.add(this.sbItem, {
            title: 'Mode: Insert'
            });
        this.sbItem.textContent = 'Insert';
        if (this.hidden) {
            this.sbItem.classList.remove('hide-indictator');
            }
        this.sbItem.classList.remove('mode-overwrite');
        this.sbItem.classList.add('mode-insert');
        return this.log("disable:: ends");
        };

    OvertypeMode.prototype.updateCursorStyle = function(editor) {
        var view;
        view = atom.views.getView(editor);
        if (this.active(editor)) {
            return view.classList.add(this.caretClass);
            }
        else {
            return view.classList.remove(this.caretClass);
            }
        };

    OvertypeMode.prototype.updateCursorStyles = function() {
        var editor, i, len, ref, results;
        if (!this.cfg('Package.changeCaretStyle')) {
            return;
            }
        ref = atom.workspace.getTextEditors();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
            editor = ref[i];
            results.push(this.updateCursorStyle(editor));
            }
        return results;
        };

    OvertypeMode.prototype.prepareEditor = function(editor) {
        this.log("prepareEditor:: starts editor.id='" + editor.id + "'");
        if (this.cfg('Keypress.keyReturn')) {
            if (editor.pristine_insertNewline == null) {
                editor.pristine_insertNewline = editor.insertNewline;
                editor.insertNewline = (function(_this) {
                    return function() {
                        return _this.enter();
                        };
                    })(this);
                }
            }
        editor.observeSelections((function(_this) {
            return function(sel) {
                var fitsCurrentLine, isAutocompleteInsert;
                if (sel.pristine_insertText == null) {
                    sel.pristine_insertText = sel.insertText;
                    }
                isAutocompleteInsert = function(sel, txt) {
                    var minLen, r, selLen, selTxt, txtLen;
                    minLen = _this.minComplete;
                    selTxt = sel.getText();
                    selLen = selTxt.length;
                    txtLen = txt.length;
                    r = ((minLen <= selLen && selLen <= txtLen)) && (txt.startsWith(selTxt));
                    _this.log("isAutocompleteInsert:: returns '" + r + "'", 2);
                    return r;
                    };
                fitsCurrentLine = function(sel, selLen, txtLen) {
                    var lineLen, start;
                    start = sel.getBufferRange().start;
                    lineLen = sel.editor.lineTextForBufferRow(start.row).length;
                    return (lineLen - start.column + selLen - txtLen) > 0;
                    };
                return sel.insertText = function(txt, opts) {
                    var prefix, selLen, txtLen;
                    _this.log("Selection.insertText has txt='" + txt + "'", 1);
                    if (!_this.active()) {
                        return sel.pristine_insertText(txt, opts);
                        }
                    else if (!_this.cfg('enableAutocomplete')) {
                        _this.log(".insertText autocomplete-support is off.");
                        return sel.pristine_insertText(txt, opts);
                        }
                    if (!isAutocompleteInsert(sel, txt)) {
                        return sel.pristine_insertText(txt, opts);
                        }
                    _this.log(".insertText autocomplete ? txt='" + txt + "'", 1);
                    editor = sel.editor;
                    selLen = sel.getText().length;
                    txtLen = txt.length;
                    prefix = sel.getText();
                    return editor.mutateSelectedText(function(sel, idx) {
                        var line, p2, range, res;
                        range = sel.getBufferRange();
                        if (sel.isEmpty()) {
                            range.start.column -= prefix.length;
                            }
                        p2 = sel.editor.getTextInBufferRange(range);
                        if (p2 !== prefix) {
                            return;
                            }
                        _this.log(".insertText autocomplete on prefix='" + prefix + "' txt='" + txt + "'", 1);
                        if (fitsCurrentLine(sel, selLen, txtLen)) {
                            range.end.column += txtLen - p2.length;
                            res = editor.setTextInBufferRange(range, txt);
                            }
                        else {
                            line = editor.lineTextForBufferRow(range.start.row);
                            range.end.column = line.length;
                            res = sel.editor.setTextInBufferRange(range, txt);
                            }
                        sel.setBufferRange({
                            start: res.end,
                            end: res.end
                            });
                        _this.log(".insertText done range.end '" + res.end + "'", 1);
                        return res;
                        });
                    };
                };
            })(this));
        this.updateCursorStyles();
        return this.events.add(editor.onWillInsertText(this.onType));
        };

    OvertypeMode.prototype.onType = function(evt) {
        var editor, i, len, ref, results, sel, theChar, wEvent;
        if (!(editor = this.active())) {
            return;
            }
        wEvent = window.event;
        this.log("onType window-event '" + wEvent + "'");
        if (!(wEvent instanceof TextEvent)) {
            return;
            }
        this.log("onType editor.id '" + editor.id + "'");
        ref = editor.getSelections();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
            sel = ref[i];
            if (sel.isEmpty()) {
                if (sel.cursor.isAtEndOfLine()) {
                    continue;
                    }
                }
            if (!this.cfg('Others.bracketMatcher.singleCharFilter')) {
                sel.selectRight();
                continue;
                }
            if (evt.text.length === 2) {
                evt.cancel();
                theChar = evt.text[0];
                sel.insertText(theChar);
                sel.cursor.moveRight();
                results.push(this.log("onType 2-char-event '" + theChar + "'"));
                }
            else {
                results.push(void 0);
                }
            }
        return results;
        };

    return OvertypeMode;
    })();

for (cmd in actions) {
    action = actions[cmd];
    OvertypeMode.prototype[cmd] = action;
    }

module.exports = new OvertypeMode();
