import { Component, OnInit, HostListener } from '@angular/core';
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
  
  private heartShape: boolean = false;
  private brush: boolean = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.frames = [];
    this.loadFrames();
    //loads default color palette
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

  //keydown listener for arrow navigation through frames
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if(document.activeElement.id === 'frame-duration') return;
    if(event.keyCode === 37) {
      this.currentFrame = this.frames[Math.max(0, this.frames.indexOf(this.currentFrame)-1)];
    } else if(event.keyCode === 39) {
      this.currentFrame = this.frames[Math.min(this.frames.length-1, this.frames.indexOf(this.currentFrame)+1)];
    }
  }

  //sets the current color to the given color
  selectColor(color: Color) {
    this.currentColor = color;
  }

  //checks if cell should be painted while hovering
  onHover(cell: MatrixCell, event: MouseEvent) {
    if(event.buttons === 1 && this.brush) {
      this.paint(cell);
    }
  }
  
  //event handler for color pick using the middle mouse button and for the paint brush
  onMousedown(cell: MatrixCell, event: MouseEvent) {
    if(event.button === 0) {
      this.paint(cell);
    } else if (event.button === 1) {
      this.currentColor.red = cell.red;
      this.currentColor.blue = cell.blue;
      this.currentColor.green = cell.green;
    }
  }
  
  //sets the color of given cell to current selected color
  paint(cell: MatrixCell) {
    if(cell.red !== this.currentColor.red || cell.green !== this.currentColor.green || cell.blue !== this.currentColor.blue) {
      cell.red = this.currentColor.red;
      cell.green = this.currentColor.green;
      cell.blue = this.currentColor.blue;
      console.log(cell);
    }
  }

  //checks if user input through number field is in range
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

  //sets all pixels for current frame to black
  clear() {
    for(let i = 0; i < 64; i++) {
      this.currentFrame.data[i].red = 0;
      this.currentFrame.data[i].green = 0;
      this.currentFrame.data[i].blue = 0;
    }
    
  }

  //loads given frame into editor
  loadFrame(frame: Frame) {
    this.currentFrame = frame;
  }

  //deletes frame from framelist and automatically sets next frame active
  deleteFrame() {
    if(this.frames.length <= 1) return;
    let indexOf = this.frames.indexOf(this.currentFrame);
    this.frames.splice(indexOf, 1);
    this.loadFrame(this.frames[Math.min(this.frames.length-1, indexOf)]);
    
  }

  //copies the current selected frame into a new one which is inserted at the end of the frame array
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
    
  }

  //moves selected frame upwards in frame array
  left() {
    let indexOf: number = this.frames.indexOf(this.currentFrame);
    this.frames[indexOf] = this.frames[indexOf-1];
    this.frames[indexOf-1] = this.currentFrame;
    
  }

  //moves selected frame downwards in frame array
  right() {
    let indexOf: number = this.frames.indexOf(this.currentFrame);
    this.frames[indexOf] = this.frames[indexOf+1];
    this.frames[indexOf+1] = this.currentFrame;
    
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

  //returns if a given pixel position is in the heart 
  isInHeart(position: number): boolean {
    return this.heart[position];
  }

  //sends framelist to backend
  sendRequest() {
    this.http.post("http://192.168.178.231:3000/update/", {id:2, frames:this.frames}).subscribe(res => {
      console.log(res);
    });
  }

  //loads framelist from backend
  loadFrames() {
    this.http.get("http://192.168.178.231:3000/test/").subscribe(res => {
      console.log(res);
      if(res['animation'] !== undefined && res['animation'].frames.length > 0) {
        this.frames = res['animation'].frames;
        this.currentFrame = this.frames[0];
      } else {
        console.log("abcx");
        this.addFrame();
      }
    });
  }

  //returns hex code of current selected color
  getColorCode(): string {
    return "#"+this.currentColor.red.toString(16).padStart(2, '0').toUpperCase()+this.currentColor.green.toString(16).padStart(2, '0').toUpperCase()+this.currentColor.blue.toString(16).padStart(2, '0').toUpperCase(); 
  }

}
