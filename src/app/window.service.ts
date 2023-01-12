import { Injectable, Type } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BehaviorSubject, Observable } from 'rxjs';


export class WindowInfo {
  dialogComponent: HTMLElement | null = null
  onTop = false
  constructor(
    public title: string,
    public wid: number,
    public ref: DynamicDialogRef,
    public config: Partial<WindowConfig>
  ){}

  get zIndex(): number{
    if(this.dialogComponent){
      return parseInt(this.dialogComponent.style.zIndex)
    }
    return 0
  }

  set zIndex(idx: number){
    if(this.dialogComponent){
      this.dialogComponent.style.zIndex = String(idx)
    }
  }

}

export type WindowConfig = {
  title: string
  width: string
  data: any
}

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  windowInfoListSubject = new BehaviorSubject<WindowInfo[]>([])
  windowInfoList$: Observable<WindowInfo[]>
  private wseq = 1
  private windowInfos: {[key: number]: WindowInfo} = {}
  private baseZIndex = 10000

  constructor(
    private dialogService: DialogService,
  ) { 
    this.windowInfoList$ = this.windowInfoListSubject.asObservable()
  }

  open(componentType: Type<any>, config: Partial<WindowConfig>){
    const wid = this.wseq++
    const title = config.title || `Id: ${wid}`
    const ref = this.dialogService.open(componentType, {
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
    this.windowInfos[wid] = new WindowInfo(title, wid, ref, config)
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

  private notifyWindowChanged(){
    this.windowInfoListSubject.next(Object.values(this.windowInfos))
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

  private removeWindow(wid: number){
    delete this.windowInfos[wid]
    this.notifyWindowChanged()
  }
}
