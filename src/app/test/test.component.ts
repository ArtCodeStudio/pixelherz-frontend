import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatrixCell } from './matrix-cell';
import { Frame } from './frame';
import { Color } from './color';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  private frames: Frame[];
  private currentFrame: Frame;

  private colors: Color[];
  private currentColor: Color;

  private red: number = 255;
  private green: number = 255;
  private blue: number = 255;
  
  private heartShape: boolean = false;
  private brush: boolean = true;

  constructor(private http: HttpClient) {
    this.frames = [];
    this.loadFrames();
    this.colors = [
      new Color(255, 0, 0), 
      new Color(0, 255, 0), 
      new Color(0, 0, 255),
      new Color(255, 102, 0), 
      new Color(197, 17, 98), 
      new Color(255, 247, 0), 
      new Color(0, 255, 255), 
      new Color(0, 0, 0)
    ];
    this.currentColor = this.colors[0];
  }

  ngOnInit() {
  }

  selectColor(color: Color) {
    this.currentColor = color;
  }

  onHover(cell: MatrixCell, event: MouseEvent) {
    if(event.buttons === 1 && this.brush) {
      this.paint(cell);
    }
  }
  
  onMousedown(cell: MatrixCell, event: MouseEvent) {
    if(event.button === 0) {
      this.paint(cell);
    } else if (event.button === 1) {
      this.currentColor.red = cell.red;
      this.currentColor.blue = cell.blue;
      this.currentColor.green = cell.green;
    }
  }
  
  paint(cell: MatrixCell) {
    if(cell.red !== this.currentColor.red || cell.green !== this.currentColor.green || cell.blue !== this.currentColor.blue) {
      cell.red = this.currentColor.red;
      cell.green = this.currentColor.green;
      cell.blue = this.currentColor.blue;
      console.log(cell);
      this.sendRequest();  
    }
  }

  validateRed() {
    if(this.currentColor.red === null) this.currentColor.red = 0;
    if(this.currentColor.red  > 255) this.currentColor.red = 255;
    if(this.currentColor.red  < 0) this.currentColor.red = 0;
  }

  validateGreen() {
    if(this.currentColor.green === null) this.currentColor.green = 0;
    if(this.currentColor.green  > 255) this.currentColor.green = 255;
    if(this.currentColor.green  < 0) this.currentColor.green = 0;
  }

  validateBlue() {
    if(this.currentColor.blue === null) this.currentColor.blue = 0;
    if(this.currentColor.blue > 255) this.currentColor.blue = 255;
    if(this.currentColor.blue < 0) this.currentColor.blue = 0;
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
      if(this.currentFrame) {
        cells[i] = new MatrixCell(i, 
          this.currentFrame.data[i].red, 
          this.currentFrame.data[i].green,
          this.currentFrame.data[i].blue
          );
      } else {
        cells[i] = new MatrixCell(i, 0, 0, 0);
      }
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

  isInHeart(position: number): boolean {
    return this.heart[position];
  }

  sendRequest() {
    this.http.post("http://localhost:3000/test/", {frames:this.frames}).subscribe(res => {
      console.log(res);
    });
  }

  loadFrames() {
    this.http.get("http://localhost:3000/test/").subscribe(res => {
      console.log(res);
      if(res['frames'] !== undefined && res['frames'].length > 0) {
        this.frames = res['frames'];
        this.currentFrame = this.frames[0];
      } else {
        console.log("abcx");
        this.addFrame();
      }
    });
  }

}
