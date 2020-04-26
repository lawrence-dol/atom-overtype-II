module.exports =

Package:
  order : 1
  type  : 'object'
  properties:

    startMode:
      title: 'Sets the default Mode.'
      description: """
      The **insert**-mode is Atoms normal input-mode. Set this to **overwrite** if you want to startup in **overwrite**-mode.
      """
      order   : 2
      type    : 'string'
      default : 'insert'
      enum    : [ 'insert', 'overwrite' ]
    
    showIndicator:
      title: 'Display the Mode-Indicator in the Status-Bar.'
      description: """
        Displays a mode-indicator either on the **left**- or **right**-side of the status-bar. Select **no** to hide the indicator.
        """
      order   : 3
      type    : 'string'
      default : 'right'
      enum    : [ 'left', 'right', 'no' ]
      
    changeCaretStyle:
      title: 'Changes the Caret/Curser display-style.'
      description: """
        Since i prefer *simple-block-cursor*-pkg, one can use this setting to deactivate any changes to the caret-CSS-styles from this package.
        """
      order   : 4
      type    : 'boolean'
      default : on
    
    notificationLevel:
      title: 'Sets the Notification-Level.'
      description: """
        Notifications of *fatal-errors* will always be displayed. For debugging via dev-console use the debug-switch below.
        """
      order   : 49
      type    : 'string'
      enum    : [ 'Success', 'Info', 'Warning', 'Error', 'FatalError' ]
      default : 'Error'
      
    debug:
      title: 'Activate Debug-Messages.'
      description: 'Writes *some* debug-infos to the devtools-console.'
      order   : 50
      type    : 'boolean'
      default : off


Keypress:
  title     : 'Adjust Behaviour of Keypress-actions.'
  type      : 'object'
  properties:
    
    keyDelete:
      title: 'Changed behaviour of the Delete-key.'
      description: """
        In **overwrite**-mode a keypress replaces the character under the caret with a space-char. Not changing the line-length. When the caret is at the very end of a line, then nothing happens.
        """
      order   : 7
      type    : 'boolean'
      default : off

    keyDeleteSpace:
      title: 'Delete removes Space-characters.'
      description: """
        Remove space-char under caret. This will **only** work in
        **single-caret-mode**, when no selections exist.
        """
      order   : 8
      type    : 'boolean'
      default : off

    keyBackspace:
      title: 'Changed Behaviour of the Backspace-key.'
      description: """
        In **overwrite**-mode a keypress replaces the character left from the caret with a space-char. Not changing the line-length. When the caret is positioned at the very beginning of a line, then nothing happens.
        """
      order   : 12
      type    : 'boolean'
      default : off
  
    keydPaste:
      title: 'Use destructive-insert behaviour for clipboard-paste operations.'
      description: """
        When enabled, any common paste-operation (Ctrl-v, Cmd-v) in **overwrite**-mode performs a *destructive*-insert starting from the current caret-position to the right. The contents of the clip-board **overwrite the existing contents**.
        """
      order   : 15 
      type    : 'boolean'
      default : off
      
    keyReturn:
      title: 'Changed Behaviour of the Return-key.'
      description: """
        When enabled, a RETURN-keypress won't insert a new-line. Instead the caret moves to the beginning of the next line.
        """
      order   : 18
      type    : 'boolean'
      default : off


Others:
  
  title: 'Relevant Settings from other Packages :'
  description: """This package depends on several other packages. All of them belong to Atom and are built-ins. Some settings of these may cause glitches or surprising behavior. You may adjust the options here or in the respective package-views.<br/>
  This pkg depends on **atom-status-bar**, **line-ending-selector**, **settings-view** and supports *autocomplete-plus* and *bracket-matcher*.
  """
  type: 'object'
  properties:
    
    autocompletePlus:
      title: 'Autocomplete-plus'
      description: """
      `Autocomplete-plus` allows for setting the minimal-word-length that triggers the process. It defaults to three=3. It uses a fuzzy-algorithm to find reasonable suggestions even when misspelled. Such suggestions cannot be reliably detected by this package. Therefore i recommend to activate the `strictMatching`-option.<br/>
      Snippets can be inserted, but the jump-between-placeholder feature does not and will never work reliable. Better switch back to `insert-mode`, where it will work.
      """
      type: 'object'
      properties:
        
        strictMatching:
          title: 'Strict-matching will turn the fuzzy-matcher off.'
          type: 'boolean'
          default: off
          
        minimumWordLength:
          title: 'Minimum Word Length. recommended >= 3'
          type: 'integer'
          default: 3
          minimum: 2
      
        enableDetection:
          title: 'Support to enable Autocomplete-plus Insertions.'
          description: """
            When enabled a **autocomplete-insert** overtypes the buffer-line. If the remaining space on the current line does not provide enough space, then the line will be expanded.
            """
          type    : 'boolean'
          default : on


    autocompleteSnippets:
      
      title: 'Autocomplete-Snippets'
      description: """
      `Autocomplete-Snippets` add snippet-insertion to `autocomplete-plus`. Insertion of static snippets should works. The tab-jumping of snippets containing placeholders will probably not work and cannot be supported.<br/>
      I'd recommend to turn it off.
      """
      type: 'object'
      properties:
        turnOff:
          title: 'Deactivate during overtype-mode'
          type: 'boolean'
          default: on


    editor:
      
      title: 'Atoms editor auto-indentation settings.'
      description: """
      The editors core-settings may cause minor glitches. The `AtomicSoftTabs`-option in particular.<br/>
      Some 3rd-party-packages support similar features. If you experience glitches during `overtype-mode` then try to disable them an report back if that solves the issue. In a future release i might provide a option to disable such packages only when overtype-mode becomes activ.
      """
      type: 'object'
      properties:
        atomicSoftTabs:
          title   : 'Changes the Caret-movement over Soft-Tabs.'
          type    : 'boolean'
          default : off
        autoIndent:
          title   : 'Automatic Indentation.'
          type    : 'boolean'
          default : off
        autoIndentOnPaste:
          title   : 'Automatic Indentation on Paste.'
          type    : 'boolean'
          default : off
          
    brackeMatcher:
      
      title: 'Atoms bracket-matcher.'
      description: 'The bracket matcher is a incredibly usefull tool. Unfortunatly it will loose a bit of its usefullness during `overtype-mode`. Some of insertions performed by the bracket matcher make no sense. E.g. inserting a full pair at the caret-position will have the second part of the pair overwritten by the next keypress. So this is a matter of discussion. I use the **single-char-filter**-option. It filters the bracket-events and passes only the opening-char thru.'
      type: 'object'
      properties:
        
        singleCharFilter:
          title: 'Single Character Filter.'
          description   : """
          Reduces a two-char-insert of bracket-matcher to one char=the opening part. A single press `[` will insert `[`.
          """
          type    : 'boolean'
          default : off
          
        alwaysSkipClosingPairs:
          title   : 'Always skip closing pairs in front of the cursor.'
          type    : 'boolean'
          default : on
          
    
    
