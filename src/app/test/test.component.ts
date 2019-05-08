import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatrixCell } from './matrix-cell';
import { sendRequest } from 'selenium-webdriver/http';
import { isObject } from 'util';
import { Frame } from './frame';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  private frames: Frame[];
  private currentFrame: Frame;

  private colorPalette: MatrixCell[];

  private red: number = 255;
  private green: number = 255;
  private blue: number = 255;
  
  private heartShape: boolean = false;

  constructor(private http: HttpClient) {
    this.frames = [];
    this.loadFrames();
    this.colorPalette = Array(16);
  }

  ngOnInit() {
  }

  paint(cell: MatrixCell) {
    cell.red = this.red;
    cell.green = this.green;
    cell.blue = this.blue;
    console.log(cell);
    this.sendRequest();
  }

  validateRed() {
    if(this.red === null) this.red = 0;
    if(this.red  > 255) this.red = 255;
    if(this.red  < 0) this.red = 0;
  }

  validateGreen() {
    if(this.green === null) this.green = 0;
    if(this.green  > 255) this.green = 255;
    if(this.green  < 0) this.green = 0;
  }

  validateBlue() {
    if(this.blue === null) this.blue = 0;
    if(this.blue  > 255) this.blue = 255;
    if(this.blue  < 0) this.blue = 0;
  }

  clear() {
    for(let i = 0; i < 64; i++) {
      this.currentFrame.data[i].red = 0;
      this.currentFrame.data[i].green = 0;
      this.currentFrame.data[i].blue = 0;
    }
    this.sendRequest();
  }

  loadFrame(frame: Frame) {
    this.currentFrame = frame;
  }

  deleteFrame() {
    if(this.frames.length <= 1) return;
    let indexOf = this.frames.indexOf(this.currentFrame);
    this.frames.splice(indexOf, 1);
    this.loadFrame(this.frames[Math.min(this.frames.length-1, indexOf)]);
    this.sendRequest();
  }

  addFrame() {
    let cells: MatrixCell[] = Array(64); 
    for(let i = 0; i < 64; i++) {
      cells[i] = new MatrixCell(i, 
        this.currentFrame.data[i].red, 
        this.currentFrame.data[i].green,
        this.currentFrame.data[i].blue
        );
    }
    let frame: Frame = new Frame(100, cells);
    this.frames[this.frames.length] = frame;
    this.loadFrame(frame);
    this.sendRequest();
  }

  left() {
    let indexOf: number = this.frames.indexOf(this.currentFrame);
    this.frames[indexOf] = this.frames[indexOf-1];
    this.frames[indexOf-1] = this.currentFrame;
    this.sendRequest();
  }

  right() {
    let indexOf: number = this.frames.indexOf(this.currentFrame);
    this.frames[indexOf] = this.frames[indexOf+1];
    this.frames[indexOf+1] = this.currentFrame;
    this.sendRequest();
  }

  private heart: boolean[] = [
    false,false,false,false,false,false,false,false,
    false,true ,true ,false,false,true ,true ,false,
    true ,true ,true ,true ,true ,true ,true ,true ,
    true ,true ,true ,true ,true ,true ,true ,true ,
    true ,true ,true ,true ,true ,true ,true ,true ,
    false,true ,true ,true ,true ,true ,true ,false,
    false,false,true ,true ,true ,true ,false,false,
    false,false,false,true ,true ,false,false,false,
  ];

  isInHeart(cell: MatrixCell): boolean {
    return this.heart[cell.position];
  }

  sendRequest() {
    console.log("abc");
    let request = Array(64);
    for(let i = 0; i < 64; i++) {
      request[i] = [this.currentFrame.data[i].red, this.currentFrame.data[i].green, this.currentFrame.data[i].blue];
    }
    this.http.post("http://192.168.178.231:3000/test/", {frames:this.frames}).subscribe(res => {
      console.log(res);
    });
  }

  loadFrames() {
    this.http.get("http://192.168.178.231:3000/test/").subscribe(res => {
      console.log(res);
      if(res['frames'] !== undefined && res['frames'].length > 0) {
        this.frames = res['frames'];
        this.currentFrame = this.frames[0];
      } else {
        this.addFrame();
      }
    });
  }

}
