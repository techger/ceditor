import {Injectable} from '@angular/core'
import * as ace from 'brace'
import {Editor, EditorCommand} from 'brace'
import 'brace/mode/typescript'
import 'brace/theme/monokai'
import 'brace/ext/language_tools'
import 'brace/ext/searchbox'
import {GithubService} from '../../http/github/github.service'
import {GistService} from '../gist/gist.service'

declare const ts: any

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  private editor: Editor

  constructor (private githubService: GithubService,
               private gistService: GistService) {
  }

  public createEditor (htmlElement: HTMLElement) {
    this.editor = ace.edit(htmlElement)

    this.editor.setOptions({
      mode: 'ace/mode/typescript',
      selectionStyle: 'text',
      enableBasicAutocompletion: true,
      autoScrollEditorIntoView: true,
      enableMultiselect: true,
      theme: 'ace/theme/monokai',
      fontSize: 18
    })
  }

  public setCode (code: string) {
    this.editor.setValue(code, -1)
  }

  public getCode (): string {
    return this.editor.getValue()
  }

  public addCommands (commands: EditorCommand[]) {
    this.editor.commands.addCommands(commands)
  }

  public async run () {
    await this.eval(this.editor.getValue())
  }

  private async eval (code: string) {
    // All Ceditor functions.
    const script = this.script.bind(this)
    const gist = this.getGist.bind(this)

    return await eval(ts.transpile(code))
  }

  private async getGist (gistId: string, fileName?: string, cached: boolean = false) {
    let file

    if (cached === false) {
      const gist = await this.githubService.getGist(gistId)

      if (fileName && gist.files[fileName]) {
        file = gist.files[fileName].content
      } else {
        // @ts-ignore
        file = Object.values(gist.files)[0].content
      }
    } else {
      file = this.gistService.getCachedFile(fileName)
    }

    return await this.eval(file)
  }

  private script (url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.scriptAlreadyExist(url)) {
        resolve()
      } else {
        const head = document.getElementsByTagName('head')[0]
        const script = document.createElement('script')

        script.className = 'ceditor-script'
        script.type = 'text/javascript'
        script.src = url

        script.onload = resolve
        script.onerror = reject

        head.appendChild(script)
      }
    })
  }

  private scriptAlreadyExist (url: string): boolean {
    for (const script of Array.from(document.querySelectorAll('.ceditor-script'))) {
      if (script.getAttribute('src') === url) {
        return true
      }
    }

    return false
  }

}
