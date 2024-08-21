
import {env, Position, Range, Selection, SnippetString, window, workspace, WorkspaceEdit } from 'vscode';



function toggleHanding(num: number){
    const editor = window.activeTextEditor!;
    let t = editor.selection.active.line, n = editor.document.lineAt(t).text;
    return editor.edit((e) =>{
        const pattern= /^(#{1,6} ).*/g;
        let res = pattern.exec(n);
        if (res !== null){
            e.delete(new Range(new Position(t, 0), new Position(t, res[1].length)));
            if (res[1].length === (num + 1)) {return;}
        }
        e.insert(new Position(t, 0), "#".repeat(num) + " ");
    }); 
}

type headFuncType = (num: number) => Thenable<boolean>;

function carringFun(fun: headFuncType, num: number){
    return function (){
        return fun(num);
    };
}

// 标题相关
export const toggleHanding1 = carringFun(toggleHanding, 1);
export const toggleHanding2 = carringFun(toggleHanding, 2);
export const toggleHanding3 = carringFun(toggleHanding, 3);
export const toggleHanding4 = carringFun(toggleHanding, 4);
export const toggleHanding5 = carringFun(toggleHanding, 5);
export const toggleHanding6 = carringFun(toggleHanding, 6);


// 插入表格
export function insertTable(){
    const editor = window.activeTextEditor!;
    const line = editor.selection.active.line;
    const nullLine = editor.document.lineAt(line - 1).text.trim() === '' ? '': '\n';
    const snippet = nullLine + "| ${1:head1} | ${2:head2} |\n| ----- | ----- |\n| ${3:body1} | ${4:body2} |";
    return editor.insertSnippet(new SnippetString(snippet));
}


// 插入代码块
export function insertCodeBlock() {
    const editor = window.activeTextEditor!;
    return editor.insertSnippet(new SnippetString('```$0\n$TM_SELECTED_TEXT\n```'));
}



let listMarker: string[] = ['1.', '1)', '-', '+', '*'];

export function toggleList(marker: string) {
    const editor = window.activeTextEditor!;
    const doc = editor.document;
    const p= listMarker.map((val) => val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = RegExp("(?<=^\\s*)" + `(?:${p.join('|')})\\s(?:\\[(?:x| )\\]\\s)?`); 
    let batchEdit = new WorkspaceEdit();
    return editor.edit((e) =>{
        for (const selection of editor.selections) {
            for (let line = selection.start.line; line <= selection.end.line; line++) {
                const lineText = doc.lineAt(line).text;
                
                const res = lineText.match(pattern);
                if (res) {
                    console.log(res);
                    e.delete(new Range(line, res.index!, line, res.index! + res[0].length));
                    if (res[0].length === marker.length + 1){continue;}
                }
                const indentation = lineText.length - lineText.trimStart().length;
                console.log("插入内容" + marker + `${line}`);
                e.insert(new Position(line, indentation), marker + ' ');
                    
                
            }
        }

    });
    
}



function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    //$&表示整个被匹配的字符串
}
  


function styleByWrapping(startPattern: string, endPattern: string= startPattern) {
    const editor = window.activeTextEditor!;
    const selection = editor.selection;
    
    let newSelection: Selection;
    
    let batchEdit = new WorkspaceEdit();
    const wordPattern = RegExp(`${escapeRegExp(startPattern)}.*?${escapeRegExp(endPattern)}`);
    let wordRange = editor.document.getWordRangeAtPosition(selection.active, wordPattern);
    if (wordRange) {
        console.log(2);
        const text = editor.document.getText(wordRange);
        const newText= text.slice(startPattern.length, - endPattern.length);
        
        batchEdit.replace(editor.document.uri, wordRange, newText);
        let newCursorPos = wordRange.end.with({character: wordRange.end.character - (startPattern + endPattern).length});
        newSelection = new Selection(newCursorPos, newCursorPos);
    } else {
        console.log(1);
        let text: string;
        if (selection.isEmpty) {
            wordRange = editor.document.getWordRangeAtPosition(selection.active);
            wordRange = wordRange !== undefined ? wordRange: selection;
            text = editor.document.getText(wordRange);
        } else {
            wordRange = selection;
            text = editor.document.getText(wordRange);
            
        } 
        newSelection = new Selection(wordRange.start.with({character: wordRange.start.character + startPattern.length}), wordRange.end.with({character: wordRange.end.character + startPattern.length}));
        batchEdit.replace(editor.document.uri, wordRange, startPattern + text + endPattern);
    }

    return workspace.applyEdit(batchEdit).then (() => {
        editor.selection = newSelection;
    });
}

export const toggleBold = () => styleByWrapping('**');
export const toggleItalic = () => styleByWrapping('__');
export const toggleCodeSpan = () => styleByWrapping('`');
export const toggleStrikeThrough = () => styleByWrapping('~~');
export const toggleMath = () => styleByWrapping('$');


export function toggleQuote () {
    const editor = window.activeTextEditor!;
    let selections = editor.selections;
    const doc = editor.document;
    let batchEdit = new WorkspaceEdit();
    const prefixPattern = /(?<=^\s*)>(?= )/;
    let isQuote: boolean = true;
    
    for (const [i, selection] of selections.entries()) {
        console.log(i);
        let startLine, endLine: number;
        if (selection.isEmpty) {
            for (startLine = selection.active.line; startLine >= 0; startLine --) {
                if (! prefixPattern.test(doc.lineAt(startLine).text)) {break;}
            }
            for (endLine = selection.active.line; startLine <= editor.document.lineCount; endLine ++) {
                console.log(editor.document.lineCount);
                if (! prefixPattern.test(doc.lineAt(endLine).text)) {break;}
            }
        } else {
            startLine = selection.start.line;
            endLine = selection.end.line;
        }
        console.log(i);
        console.log(endLine);
        if (i === 0) {
            const standardText = doc.lineAt(selection.active.line).text;
            isQuote = prefixPattern.test(standardText);
        }
        for (let line = startLine; line <= endLine; line++) {
            const text = editor.document.lineAt(line).text;
            const res = prefixPattern.exec(text); 
            if ((res !== null) && isQuote) {
                batchEdit.delete(editor.document.uri, new Range(line, res.index, line, res.index + 2));
            } else if ((res === null) && !isQuote) {
                
                if (startLine === line && startLine !== 0) {
                    const nullLine= doc.lineAt(startLine - 1).text.trim() === '' ? '': '\n';
                    batchEdit.insert(editor.document.uri, new Position(line, 0), `${nullLine}> `);
                } else {
                    batchEdit.insert(editor.document.uri, new Position(line, 0), `> `);
                }
                
            }
            
        }
    }
    return workspace.applyEdit(batchEdit).then (() => {
       
    });
}

function createLinkRegex(): RegExp {
    // unicode letters range(must not be a raw string)
    const ul = '\\u00a1-\\uffff';
    // IP patterns
    const ipv4_re = '(?:25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}';
    const ipv6_re = '\\[[0-9a-f:\\.]+\\]';  // simple regex (in django it is validated additionally)


    // Host patterns
    const hostname_re = '[a-z' + ul + '0-9](?:[a-z' + ul + '0-9-]{0,61}[a-z' + ul + '0-9])?';
    // Max length for domain name labels is 63 characters per RFC 1034 sec. 3.1
    const domain_re = '(?:\\.(?!-)[a-z' + ul + '0-9-]{1,63}(?<!-))*';

    const tld_re = ''
        + '\\.'                               // dot
        + '(?!-)'                             // can't start with a dash
        + '(?:[a-z' + ul + '-]{2,63}'         // domain label
        + '|xn--[a-z0-9]{1,59})'              // or punycode label
        + '(?<!-)'                            // can't end with a dash
        + '\\.?'                              // may have a trailing dot
        ;

    const host_re = '(' + hostname_re + domain_re + tld_re + '|localhost)';
    const pattern = ''
        + '^(?:[a-z0-9\\.\\-\\+]*)://'  // scheme is not validated (in django it is validated additionally)
        + '(?:[^\\s:@/]+(?::[^\\s:@/]*)?@)?'  // user: pass authentication
        + '(?:' + ipv4_re + '|' + ipv6_re + '|' + host_re + ')'
        + '(?::\\d{2,5})?'  // port
        + '(?:[/?#][^\\s]*)?'  // resource path
        + '$' // end of string
        ;

    return new RegExp(pattern, 'i');
}

const singleLinkRegex: RegExp = createLinkRegex();

export async function toggleLink() {
    const editor = window.activeTextEditor!;
    let selection = editor.selection;    

    const linkRegex = /\[.*?\]\(.*?\)/;
    if (selection.isSingleLine){
        const wordRange= editor.document.getWordRangeAtPosition(selection.active, linkRegex);
        if (wordRange) {           
            
            const linkText = editor.document.getText(wordRange);
            const content = (/\[(.*?)\]/.exec(linkText) as RegExpExecArray)[1];
            return editor.edit( e => 
                e.replace(wordRange, content)
                );
            } else {
                if (selection.isEmpty) {
                    const range = editor.document.getWordRangeAtPosition(selection.active);
                    console.log("1");
                    if (range){
                        editor.selection = new Selection(range.start, range.end);
                    }
                }
                let text = (await env.clipboard.readText()).trim();
                text = singleLinkRegex.test(text)? text: '';
                
                return editor.insertSnippet(new SnippetString("[$TM_SELECTED_TEXT](${1:" + text + "})"));
            }
            
        }
        else {
            return window.showErrorMessage("Only selection single line!");
        }
  
}