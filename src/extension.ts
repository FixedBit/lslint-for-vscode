// LSLint Support For VSCode by Jason Hawks / FixedBit Innovations
// You must have lslint on your path for this to function

import * as vscode from "vscode";

// called on extension activation
export function activate(context: vscode.ExtensionContext) {
    // our active editor window
	let activeEditor = vscode.window.activeTextEditor;
    // our timer variable
	let timeout: NodeJS.Timer | undefined = undefined;
    // timer var for checking on lslint to reset variable
    let checkTimeout: NodeJS.Timer | undefined = undefined;
    // globl vars for ranges to decorate and messages to show
    let rangesToDecorate: vscode.DecorationOptions[] = [];
    let globalMessages: { name: string; text: string; }[] = [];
    // var to store if we have displayed lslint not found error already this session
    let errorNotFoundShown = false;

    // set our global for realtime linting enabled
    let enabledRealTime = vscode.workspace.getConfiguration('lslint').get('realtimeLinting', true);
    // set our global for linting on save
    let enabledSaving = vscode.workspace.getConfiguration('lslint').get('lintOnSave', true);

    // text decoration
    let decorationType: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderStyle: 'solid',
        overviewRulerColor: 'blue',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: { // used in light color themes
            borderColor: 'darkBlue'
        },
        dark: { // used in dark color themes
            borderColor: 'lightBlue'
        },
        textDecoration: 'wavy underline'
    });;

    // changed editor callback
    const changedActiveTextEditor = (editor: vscode.TextEditor | undefined) => {
        activeEditor = editor;
        if (editor && enabledRealTime) {
            console.log("Editor Changed LSLinting");
            lslintDocument();
        }
    };

    // changed document callback
    const changedTextDocument = (event: vscode.TextDocumentChangeEvent) => {
        // do not trigger unless we have a change and are enabled, and lslint not found error has not been flagged
        if (!event.document.isDirty || errorNotFoundShown) { return; }
        else if (activeEditor && event.document === activeEditor.document && enabledRealTime) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = undefined;
            }

            // get our real time wait setting
            let realTimeWait = vscode.workspace.getConfiguration('lslint').get('realtimeWait', 1000);

            if (realTimeWait < 1000) { 
                // setting was less than 1000 ms so we set it to default
                realTimeWait = 1000;
            } 

            // set our timer to wait before calling lslintDocument
            timeout = setTimeout( () => { 
                    console.log(`Realtime Timer at ${realTimeWait}ms Linting`);
                    lslintDocument();
            }, realTimeWait);
        }
    };

    // save document callback
    const saveTextDocument = (document: vscode.TextDocument) => {
        if (!enabledSaving) { return; }
        if (activeEditor && document === activeEditor.document) {
            // we are passing with true for saving to file so no pause
            console.log("LSLinting Save Trigger");
            lslintDocument(true);
        }
    };

    // changed configuration callback
    const changedConfiguration = (event: vscode.ConfigurationChangeEvent) => {
        enabledRealTime = vscode.workspace.getConfiguration('lslint').get('realtimeLinting', true);
        enabledSaving = vscode.workspace.getConfiguration('lslint').get('lintOnSave', true);
        console.log(`LSLint: Configuration changed - adopting new settings ~ realtimeLinting: ${enabledRealTime} lintOnSave: ${enabledSaving} event:${event.toString()}`);
    };

    // generate our parsed line matches from raw incoming data
    function generateMatches(payload: string) {
        // if not active, exit
        if (!activeEditor) {
			return;
		}
        // split by newline
        let allLines = payload.split(/\n/);
        // array of parsed lines
        let parsedLines: { name: string; line: number; text: string; at: number; }[] = [];
    
        // iterate all lines found
        allLines.forEach(function(item) {
            if(item.includes("ERROR::")) { // line is an error
                // split on numbers
                let numbers = item.match(/\d+/g);
                // remove the search text from string
                let trim = item.substring(9);
                // split string between line number and description
                var split = trim.split(": ", 2);
                // add to array
                parsedLines.push({name: "Error", line: parseInt(numbers![0]) - 1, text: split[1], at: parseInt(numbers![1]) - 1});
            } else if (item.includes("WARN::")) { // line is a warning
                // split on numbers
                let numbers = item.match(/\d+/g);
                // remove the search text from string
                let trim = item.substring(8);
                // split string between line number and description
                var split = trim.split(": ", 2);
                // add to array
                parsedLines.push({name: "Warn", line: parseInt(numbers![0]) - 1, text: split[1], at: parseInt(numbers![1]) - 1});
            }
        });
        // return our array
        return parsedLines;
    }

    // parse the data we received
	function parseLinting(lslintOutput: string) {
        // call matching function and assign output to errors
        const errors = generateMatches(lslintOutput);

        // iterate our errors
        errors!.forEach(matches => {

            // assign to message.x
            const message = {
                name: matches["name"],
                line: matches["line"],
                text: matches["text"],
                at: matches["at"]
            };

            // the line our error is on
            var errorLine = activeEditor!.document.lineAt(message.line).text;
            // find our first letter after any spaces
            var match = errorLine!.match(/[^ ]/);
            // position of the firstChar character on the line
            var firstChar = errorLine!.indexOf(match!.toString());

            var startPos = new vscode.Position(message.line, firstChar);
            var endPos = new vscode.Position(message.line, errorLine!.length);

            // add our range and message data to be passed to array
			const decoration = {
				'range': new vscode.Range(startPos, endPos),
				'hoverMessage': message.text
			};

            // push our information to array
            rangesToDecorate.push(decoration);
            globalMessages.push({name: message.name, text: 'Line ' + message.line + ': ' + message.text});
        });
    }

    function callbackWaitForLSLint() {
        // variable for callback
        var commandExistsSync = require('command-exists').sync;
        // if lslint is found we clear the not found variable and clear the timer
        if (commandExistsSync('lslint')) { 
            console.log('LSLint: Timer ran - found lslint, clearing timer.');
            vscode.window.showInformationMessage("LSLint found in path. Extension has been enabled.");
            errorNotFoundShown = false; 
            clearTimeout(checkTimeout!);
            checkTimeout = undefined;
        }
    }

    // our man of the hour, do our linting
    // option for passing true for saving the file, defaults to false
	function lslintDocument(saving: Boolean = false) {
        
        // we have displayed the error that lslint is not found so we exit
        if (errorNotFoundShown) { return; }

        // not active editor so we exit
		if (!activeEditor) {
            console.error("LSLint: Not active editor");
			return;
		}

        // We only want to lint lsl files
        if (activeEditor.document.languageId !== "lsl") {
            console.error("LSLint: Not LSL Script");
            return;
        }

        // clear all decorations each run
        activeEditor.setDecorations(decorationType,[]);
        
        // variable for callback
        var commandExistsSync = require('command-exists').sync;
        // if lslint not found, show message and abort
        if (!commandExistsSync('lslint')) {
            console.log("LSLint not found");
            // manual trigger so give message
            // check if we already displayed the error
            if (!errorNotFoundShown) { 
                vscode.window.showInformationMessage("You need LSLint installed to use this extension.", { title: 'Get LSLint', id: "getlslint"}).then(item => {
                    if (item?.id === 'getlslint') {
                        require('open')('https://github.com/FixedBit/lslint-for-vscode#required-extra-installs');
                    }
                }); 
                errorNotFoundShown = true;
                console.log('LSLint: wait for lslint timer started.');
                // set our timer to keep checking every 3 seconds if we found lslint on our path
                if (checkTimeout) { clearTimeout(checkTimeout); checkTimeout = undefined; }
                checkTimeout = setInterval( callbackWaitForLSLint, 3000);
            }
            return;
        }

        // clear globals
        globalMessages = [];
        rangesToDecorate = [];

        // declare our variable to be filled inside ifs
        var filePath = null; 
        if (!saving) // not saving file so must use temp file for linting
        {
            // get our text from the document
            const text = activeEditor.document.getText();
            // generate our temporary filename
            var tmpPath = require('os').tmpdir() + require('path').sep + 'lslint-tmp.lsl';
            // write our document text to our temp file
            require('fs').writeFileSync(tmpPath, text, {encoding: "utf8"});
            // set our temp files path that is sent to linter
            filePath = tmpPath;
        } else { // we are saving so do not worry with temp, just pass our real file's path
            filePath = activeEditor.document.uri.fsPath;
        }
        // we did not get a valid path so we exit
        if (!filePath) { return; }
        // declare settings variable
        var settings: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('lslint');

        let args = []; // initialize holder for our arguments
        if (settings.get("ignoreDirectives", false)) { args.push('-i'); } // argument to ignore preprocessor directives
        if (settings.get("enableSwitchStatements", false)) { args.push('-w'); } // argument to include preprocessor switch statements
        if (settings.get("enableLazyLists", false)) { args.push('-z'); } // argument to include preprocessor lazy lists
        args.push(filePath); // last argument is our file path

        // spawn our lslint process with proper arguments
        var sync = require('child_process').spawnSync;
        var lslProcess = sync('lslint', args, { encoding: 'utf8' });

        // just logging debug info if we are debugging extension
        console.log("LINTING: " + lslProcess.stderr.toString());

        // call our parsing function
        parseLinting(lslProcess.stderr.toString());
        // display document decorations
        activeEditor.setDecorations(decorationType, rangesToDecorate);

        // If we are saving our file and we asked to be notified then show warning
        if (settings.get("popupErrors", true)) {
            // iterate our errors and depending on error or warning, display the pop up
            globalMessages.forEach(match => {
                const error = {
                    name: match["name"],
                    text: match["text"]
                };
                if (error.name === 'Error') { vscode.window.showErrorMessage(error.text); }
                else if (error.name === 'Warn') { vscode.window.showWarningMessage(error.text); }
            });
        }
    }

    // run setup calls for extension
    function setupExtension() {
        // tell it function to call and register it
        vscode.window.onDidChangeActiveTextEditor((e) => changedActiveTextEditor(e), null, context.subscriptions);
        // document change callback for realtime edits, if enabled
        vscode.workspace.onDidChangeTextDocument((e) => changedTextDocument(e), null, context.subscriptions);
        // save document callback if enabled in settings
        vscode.workspace.onDidSaveTextDocument((e) => saveTextDocument(e), null, context.subscriptions);
        // changed settings refresh callback
        vscode.workspace.onDidChangeConfiguration((e) => changedConfiguration(e), null, context.subscriptions);
        // register our manual command callback
        context.subscriptions.push(vscode.commands.registerCommand('lslint.lint', () => {
            console.log("Manual LSLinting command triggered");
            lslintDocument();
        }));
    }

	// This line of code will only be executed once when your extension is activated
    console.log("LSLint for VSCode Active");

    // first load, call our setup
    setupExtension();

}

// this method is called when your extension is deactivated
export function deactivate() {}
