import { Position, Range, Selection, SnippetString, window, workspace, WorkspaceEdit } from 'vscode';



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
export function toggleCodeBlock() {
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


// export function toggleLink() {
//     const editor = window.activeTextEditor!;
//     const selection = editor.selection;    

//     const linkRegex = /\[.*?\]\(http:\S*?\)/;
//     const wordRange= editor.document.getWordRangeAtPosition(selection.active, linkRegex);
//     if (wordRange) {
//         const text = editor.document.getText(wordRange);
        
//         return editor.edit( e => {
//             e.replace(wordRange, )
//         }

//         )
//     } else {

//     }
// }