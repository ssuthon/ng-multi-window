import { Inject, Injectable, Type } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { WINDOW_REGISTRY } from './app.module';
import sortBy from 'lodash/sortBy'

export class WindowInfo {
  dialogComponent: HTMLElement | null = null
  onTop = false
  cachedZIndex = -1

  constructor(
    public title: string,
    public wid: number,
    public ref: DynamicDialogRef,
    public componentName: string,
    public config: Partial<WindowConfig>
  ){}

  get zIndex(): number{
    if(this.dialogComponent){
      this.cachedZIndex = parseInt(this.dialogComponent.style.zIndex)
    }
    return this.cachedZIndex
  }

  set zIndex(idx: number){
    if(this.dialogComponent){
      this.cachedZIndex = idx
      this.dialogComponent.style.zIndex = String(idx)
    }
  }

}

export type WindowConfig = {
  title: string
  width: string
  data: any
}

export type WindowEvent = {
  name: string
  data: any
}

type SavedData = {
  when: Date
  windows: {
    componentName: string
    config: Partial<WindowConfig>
  }[]  
}

const SAVED_DATA_KEY = 'app.savedData'

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private windowInfoListSubject = new BehaviorSubject<WindowInfo[]>([])
  windowInfoList$: Observable<WindowInfo[]>
  private windowEventSubject = new Subject<WindowEvent>()
  windowEvent$: Observable<WindowEvent>
  private wseq = 1
  private windowInfos: {[key: number]: WindowInfo} = {}
  private baseZIndex = 10000

  constructor(
    private dialogService: DialogService,
    @Inject(WINDOW_REGISTRY) private windowRegistry: {[key: string]: Type<any>}
  ) {     
    this.windowInfoList$ = this.windowInfoListSubject.asObservable()    
    this.windowEvent$ = this.windowEventSubject.asObservable()
  }

  open(componentName: string, config: Partial<WindowConfig>){
    const wid = this.wseq++
    const title = config.title || `Id: ${wid}`
    const ref = this.dialogService.open(this.windowRegistry[componentName], {
      header: title,
      data: config.data,
      width: config.width || '70%',
      resizable: true,
      draggable: true,
      modal: false,
      autoZIndex: false,
      maximizable: true,
      styleClass: `wid-${wid}`,
    })
    ref.onClose.subscribe(()=> {
      this.removeWindow(wid)
    })
    this.windowInfos[wid] = new WindowInfo(title, wid, ref, componentName, config)
    setTimeout(() => this.initWindow(wid), 100)
  }

  bringToFront(wid: number){
    let dialogs = Object.values(this.windowInfos)
    dialogs = dialogs.filter(it => it.wid != wid)
    dialogs = dialogs.sort((a, b) => b.zIndex - a.zIndex) 
    let zindex = this.baseZIndex
    dialogs.forEach(d => {
      d.zIndex = --zindex
      d.onTop = false
    })
    
    const front = this.windowInfos[wid]
    front.zIndex = this.baseZIndex
    front.onTop = true
    this.notifyWindowChanged()
  }

  emitEvent(event: WindowEvent){
    this.windowEventSubject.next(event)
  }

  clearSavedWindows(){    //should be called when user logout
    sessionStorage.removeItem(SAVED_DATA_KEY)
  }

  private notifyWindowChanged(){
    this.windowInfoListSubject.next(Object.values(this.windowInfos))
    this.saveWindows()
  }

  private initWindow(wid: number){
    const elem = document.querySelectorAll(`.wid-${wid}`)[0]
    this.windowInfos[wid].dialogComponent = elem.closest('.p-dialog-mask') as HTMLElement
    elem.addEventListener('click', event => {
      this.bringToFront(wid)
    })
    this.bringToFront(wid)
    this.notifyWindowChanged() 
  }

  private removeWindow(wid: number, notify = true){
    delete this.windowInfos[wid]
    if(notify){
      this.notifyWindowChanged()
    }
  }

  private saveWindows(){
    const data: SavedData = {when: new Date(), windows: []}
    data.windows = sortBy(Object.values(this.windowInfos), 'cachedZIndex').map(info => {
      return {
        componentName: info.componentName,
        config: info.config,
      }
    })
    sessionStorage.setItem(SAVED_DATA_KEY, JSON.stringify(data))
  }

  loadSavedWindows() : any{
    const rawData = sessionStorage.getItem(SAVED_DATA_KEY)
    if(rawData){
      const data: SavedData = JSON.parse(rawData)
      data.windows.forEach(wd => this.open(wd.componentName, wd.config))
    }
  }
}
