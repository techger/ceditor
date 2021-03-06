import {Component} from '@angular/core'
import {EditorService} from '../../../../core/services/editor/editor.service'
import {Location} from '@angular/common'
import {GistService} from '../../../../core/services/gist/gist.service'
import {DialogService} from '../../../../core/services/dialog/dialog.service'

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

  public gist: any
  public gistFiles: any[]
  public gistCachedFiles: string[]
  public currentFileName: string

  constructor (private editorService: EditorService,
               private gistService: GistService,
               private dialogService: DialogService,
               private location: Location) {
    this.init()
  }

  public async init () {
    this.gistService.onUpdate().subscribe((gist: any) => {
      this.updateGist(gist)
    })

    this.gistService.onCacheUpdate().subscribe((gistCachedFiles: any) => {
      this.gistCachedFiles = Object.keys(gistCachedFiles).filter((fileName) => {
        return gistCachedFiles[fileName] !== null
      })
    })

    this.updateGist(await this.gistService.onInit())
  }

  public async openFile (fileName: string) {
    const cachedFile = this.gistService.getCachedFile(fileName)
    const file = this.gistService.getFile(fileName)

    if (cachedFile !== null) {
      const result = await this.dialogService.showGenericDialog({
        title: 'Cached code',
        message: 'There is cached code for this file, do you want to use it?',
        buttons: ['No thanks', 'Ok']
      })

      switch (result) {
        case 0:
          this.gistService.removeCachedFile(fileName)
          this.editorService.setCode(file)
          break
        case 1:
          this.editorService.setCode(cachedFile)
          break
      }
    } else {
      this.editorService.setCode(file)
    }

    this.currentFileName = fileName
    this.gistService.setCurrentFileName(fileName)
    this.location.replaceState(`/${this.gist.id}/${fileName}`)
  }

  private updateGist (gist: any) {
    this.gist = gist

    this.gistFiles = Object.values(this.gist.files)
    this.currentFileName = this.gistService.getCurrentFileName()
  }

}
