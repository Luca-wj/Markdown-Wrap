import {CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, ExtensionContext, languages, Position, TextDocument} from "vscode";

import * as fs from "fs";


export class MdCompletionItemProvider implements CompletionItemProvider{
    langCompletions: CompletionItem[];

    // readonly EXCLUDE_GLOB: string;

    constructor() {
        let lang: any[];
        const filePath = globalThis.extensionContext.asAbsolutePath("data/languages.json");
        
        try{
            const data = fs.readFileSync(filePath, 'utf8');
            lang = JSON.parse(data);
        } catch (err) {
            console.log(err);
            throw(err);
        }
        // Object.values(lang).forEach(val =>{
        //     tmp = tmp.concat(val);
        // });
        
        // let code = Array.from(new Set(tmp)).map(obj => {
        //     let item = new CompletionItem(obj.label, CompletionItemKind.Keyword);
        //     item.insertText = obj.insertText;
        //     return item;
        // });

        const code = Array.from(new Set(lang)).map(
            obj => {
                let item = new CompletionItem(obj.label, CompletionItemKind.Keyword);
                item.insertText = obj.insertText;
                return item;
            }
        );
        
        
        this.langCompletions = [...code];
        
        // for (const item of this.mathCompletions) {
        //     const label = typeof item.label === "string" ? item.label : item.label.label;
        //     item.sortText = label.replace(/[a-zA-Z]/g, (c) => {
        //         if (/[a-z]/.test(c)) {
        //             return `0${c}`;
        //         } else {
        //             return `1${c.toLowerCase()}`;
        //         }
        //     });
        // }

        // const Always_Exclude = ["**/node_modules", "**/bower_components", "**/*.code-search", "**/.git"];
        // const excludePatterns = new Set(Always_Exclude);

        // if (configManager.get("completion.respectVscodeSearchExclude", folder)) {
        //     // `search.exclude` is currently not implemented in Theia IDE (which is mostly compatible with VSCode extensions)
        //     // fallback to `files.exclude` (in VSCode, `search.exclude` inherits from `files.exclude`) or an empty list
        //     // see https://github.com/eclipse-theia/theia/issues/13823
        //     const vscodeSearchExclude = configManager.getByAbsolute<object>("search.exclude", folder)
        //         ?? configManager.getByAbsolute<object>("search.exclude", folder)
        //         ?? {};
        //     for (const [pattern, enabled] of Object.entries(vscodeSearchExclude)) {
        //         if (enabled) {
        //             excludePatterns.add(pattern);
        //         }
        //     }
        // }

        // this.EXCLUDE_GLOB = "{" + Array.from(excludePatterns).join(",") + "}";
        

    }
    async provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): Promise<CompletionItem[] | CompletionList<CompletionItem> | undefined>  {
        // code 

        if (codeEnvCheck(document, position)){
            return this.langCompletions;
        }
        else{
            return [];
        }

    }



}

function codeEnvCheck(doc:TextDocument, pos: Position){
    const docText = doc.getText();
    const crtOffset = doc.offsetAt(pos);
    const crtLine = doc.lineAt(pos.line);
    const textBefort = crtLine.text.substring(0, pos.character);
    const textAfter = docText.substring(crtOffset);
    let matches = textAfter.match(/```/g);
    if (textBefort.match(/^```/) !== null && matches !== null && matches.length % 2 !== 0){
        return true;
    }
    else {
        return false;
    }

}