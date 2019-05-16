import { Component, OnInit, HostListener, Inject, ElementRef, ViewChild, ViewChildren } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatrixCell } from '../obj/matrix-cell';
import { Frame } from '../obj/frame';
import { Color } from '../obj/color';
import { Animation } from '../obj/animation';
import { ActivatedRoute, Router } from '@angular/router';
import {Location} from '@angular/common';
import {DOCUMENT} from '@angular/common';
import { flushMicrotasks } from '@angular/core/testing';

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
  
  private currentAnimation: Animation;
  
  private hexValue: string = 'FF0000';

  private id: number;
  private changes: boolean;

  private editName: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, private location: Location, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {
    this.changes = false;
    this.frames = [];
    this.colors = Array();

    this.currentColor = this.colors[0];

    this.route.params.subscribe(async params => {
      this.id = Number(params['id']);
      await this.loadAnimation(this.id); // (+) converts string 'id' to a number
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event: any) {
      if (this.changes) {
          event.returnValue =true;
      }
  }

  @HostListener('window:click', ['$event'])
  clickListener(event: MouseEvent) {
    if (event.target instanceof Element) {
      console.log(event.target.id);
      if(event.target.id !== "name-input" && event.target.id !== "name" ) {
        this.editName = false;
      }
    }
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
      this.changes = true;
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
      this.changes = true;
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
    this.changes = true;
    
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
    this.changes = true;
    this.loadFrame(frame);
    this.sendRequest();
  }

  switchMode() {
    this.brush = !this.brush;
  }

  //moves selected frame upwards in frame array
  left() {
    let indexOf: number = this.frames.indexOf(this.currentFrame);
    this.frames[indexOf] = this.frames[indexOf-1];
    this.frames[indexOf-1] = this.currentFrame;
    this.changes = true;
    
  }

  //moves selected frame downwards in frame array
  right() {
    let indexOf: number = this.frames.indexOf(this.currentFrame);
    this.frames[indexOf] = this.frames[indexOf+1];
    this.frames[indexOf+1] = this.currentFrame;
    this.changes = true;
    
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
  private loading: boolean;

  sendRequest() {
    this.loading = true;
    this.http.post("http://192.168.178.231:3000/animation/update/", {animationId:this.id, frames:this.frames, name:this.currentAnimation.name, repeats: this.currentAnimation.repeats, enabled: this.currentAnimation.enabled, colors: this.colors}).subscribe(res => {
      console.log(res);
      this.loading = false;
      this.changes = false;
    });
  }

  //loads framelist from backend
  async loadAnimation(id: any) {
    await this.http.get("http://192.168.178.231:3000/animation?id="+id).subscribe(res => {
      console.log(res);
      if(res['animation'] !== undefined) {
        this.colors = res['animation'].colors;
        for(let i = this.colors.length; i < 8; i++) {
          this.colors[i] = new Color(i, 255, 255, 255);
        }
        this.currentColor = this.colors[0];
        
        this.currentAnimation = new Animation(res['animation'].name, id, res['animation'].repeats, res['animation'].enabled);
        console.log(this.currentAnimation);
        if(res['animation'].frames.length < 1) {
          console.log("empty");
          this.addFrame();
          return;
        }
        this.frames = res['animation'].frames;
        
        this.currentFrame = this.frames[0];
        
      }

    });
  }

  private allowedValues: string[] = ['ArrowRight', 'ArrowLeft','Backspace', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F'];
  
  validateHex(event: KeyboardEvent): boolean {
    console.log(event);
    if(event.ctrlKey && event.key === "v") return true;
    let found = false;
    this.allowedValues.forEach(v=> {
      if(event.key === v) found = true;
    });
    return found;
  }

  checkHex() {
    if(this.hexValue.length == 6) {
      let res = this.hexToRgb(this.hexValue);
      this.currentColor.red = res.r;
      this.currentColor.green = res.g;
      this.currentColor.blue = res.b;
    }
  }

  hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  //returns hex code of current selected color
  getColorCode(): string {
    return this.currentColor.red.toString(16).padStart(2, '0').toUpperCase()+this.currentColor.green.toString(16).padStart(2, '0').toUpperCase()+this.currentColor.blue.toString(16).padStart(2, '0').toUpperCase(); 
  }



  //sends framelist to backend
  private duplicateLoading: boolean;
  duplicate() {
    if(window.confirm('Do you really want to leave the editor? You have unsaved changes left.')) {
      this.http.post("http://192.168.178.231:3000/animation/create", {name: this.currentAnimation.name + " 2"}).subscribe(res => {
        console.log(res);
        this.id = res['id'];
        this.currentAnimation.animationId = this.id;
        this.currentAnimation.name = res['name'];
        this.location.replaceState("/animation/" + this.id + "/editor");
        this.duplicateLoading = false;
        this.sendRequest();
      });
    }
  }
  

  getWidth(): number {
    return ((this.document.getElementById('name-input') as any).value.length+1) * 20;
  }

  navigateBack() {
    if(this.changes) {
      if(window.confirm('Do you really want to leave the editor? You have unsaved changes left.')) {
        this.router.navigate(['']);
      }
    } else {
      this.router.navigate(['']);
    }
  }
}
