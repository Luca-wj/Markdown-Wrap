// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as cmd from "./command";

import {MdCompletionItemProvider} from "./completion";
import { on } from 'events';






const Document_Selector_Markdown: vscode.DocumentSelector = [
    { language: "markdown", scheme: "file" },
    { language: "markdown", scheme: "untitled" },
];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "markdown-wrap" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('markdown-wrap.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Markdown Wrap!');
	});

	context.subscriptions.push(disposable);

	// my context 
	globalThis.extensionContext = context;
	


	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(Document_Selector_Markdown, new MdCompletionItemProvider())
	);
	
	// context.subscriptions.push(
	// 	vscode.commands.registerCommand("markdown-wrap.toggleHanding1", () => {
	// 		vscode.window.showInformationMessage('Vscode');
	// 	})
		 
	// );

	context.subscriptions.push(
		vscode.commands.registerCommand('markdown-wrap.toggleHanding1', cmd.toggleHanding1),
		vscode.commands.registerCommand('markdown-wrap.toggleHanding2', cmd.toggleHanding2),
		vscode.commands.registerCommand('markdown-wrap.toggleHanding3', cmd.toggleHanding3),
		vscode.commands.registerCommand('markdown-wrap.toggleHanding4', cmd.toggleHanding4),
		vscode.commands.registerCommand('markdown-wrap.toggleHanding5', cmd.toggleHanding5),
		vscode.commands.registerCommand('markdown-wrap.toggleHanding6', cmd.toggleHanding6),
		vscode.commands.registerCommand('markdown-wrap.toggleBold', cmd.toggleBold),
		vscode.commands.registerCommand('markdown-wrap.toggleItalic', cmd.toggleItalic),
		vscode.commands.registerCommand('markdown-wrap.toggleCodeSpan', cmd.toggleCodeSpan),
		vscode.commands.registerCommand('markdown-wrap.toggleStrikeThrough', cmd.toggleStrikeThrough),
		vscode.commands.registerCommand('markdown-wrap.toggleMath', cmd.toggleMath),
		vscode.commands.registerCommand('markdown-wrap.toggleLink', cmd.toggleLink),
		vscode.commands.registerCommand('markdown-wrap.toggleNumberList', () => cmd.toggleList('1.')),
		vscode.commands.registerCommand('markdown-wrap.toggleBulletList', () => cmd.toggleList('*')),
		vscode.commands.registerCommand('markdown-wrap.toggleCheckboxList', () => cmd.toggleList('- [ ]')),
		vscode.commands.registerCommand('markdown-wrap.toggleQuote', cmd.toggleQuote),
		vscode.commands.registerCommand('markdown-wrap.insertTable', cmd.insertTable),
		vscode.commands.registerCommand('markdown-wrap.insertCodeBlock', cmd.insertCodeBlock),
		vscode.commands.registerCommand('markdown-wrap.insertMathBlock', cmd.insertMathBlock)

	);



	// 动态修改设置 内容参考 https://code.visualstudio.com/docs/editor/intellisense
	const editorConfig = vscode.workspace.getConfiguration('editor', {languageId: "markdown"});
    editorConfig.update('quickSuggestions', {other: 'on'}, vscode.ConfigurationTarget.Workspace, true);

	editorConfig.update("wordBasedSuggestions", "off", vscode.ConfigurationTarget.Workspace, true);

	console.log('#'.repeat(Number(false)));
}


// This method is called when your extension is deactivated
export function deactivate() {}
