import { Component, ElementRef, OnInit } from '@angular/core';
import { WindowInfo, WindowService } from './window.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    title = 'test-d';
    windowInfoList: WindowInfo[] = []
    selectedWindow: WindowInfo | undefined
    msg = ''

    constructor(
        public windowService: WindowService
    ) {
        
    }
    ngOnInit(): void {
        this.windowService.windowInfoList$.subscribe(list => {
            this.windowInfoList = list
            this.selectedWindow = list.find(it => it.onTop)
        })
        this.windowService.loadSavedWindows()
    }

    doIt() {
        this.windowService.open('foo', {data: {msg: this.msg}, title: this.msg})
    }

    windowChanged(){
        if(this.selectedWindow){
            this.windowService.bringToFront(this.selectedWindow.wid)
        }
    }
}
