import { Component, OnInit } from '@angular/core';
import {DynamicDialogRef} from 'primeng/dynamicdialog';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';

@Component({
  selector: 'app-foo',
  templateUrl: './foo.component.html',
  styleUrls: ['./foo.component.css']
})
export class FooComponent implements OnInit {
  msg = ''
  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.msg = this.config.data.msg
  }

  selfClose(){
    this.ref.close()
  }


}
