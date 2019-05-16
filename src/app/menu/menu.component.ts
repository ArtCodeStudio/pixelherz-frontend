import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { Animation } from '../obj/animation';
import { HttpClient } from '@angular/common/http';
import { Frame } from '../obj/frame';
import { MatrixCell } from '../obj/matrix-cell';
import { ReturnStatement } from '@angular/compiler';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  public animations: Animation[];
  public currentAnimation: Animation;

  constructor(private http: HttpClient, private changeDetector : ChangeDetectorRef) { }

  ngOnInit() {
    this.animations = Array();
    this.loadAnimations();
    this.animate();
  }


  private frames: Frame[];
  private currentFrame: Frame;
  
  selectAnimation(animation: Animation) {
    this.currentAnimation = animation;
    this.loadAnimation();
  }

  async loadAnimation() {
    await this.http.get("http://192.168.178.231:3000/animation?id="+this.currentAnimation.animationId).subscribe(res => {
      console.log(res);
      if(res['animation'] !== undefined && res['animation'].frames.length > 0) {
        this.frames = res['animation'].frames;
        this.currentFrame = this.frames[0];
      } else {
        this.frames = undefined;
        this.currentFrame = undefined;
      }
    });
  }

  private index: number;

  animate() {
    if(this.frames == undefined || this.frames.length == 0) {
      setTimeout(() => this.animate(), 100);
      return;
    }
    if(this.index < this.frames.length){
      this.currentFrame = this.frames[this.index++];
    } else {
      this.index = 0;
      this.animate();
      return;
    }
    setTimeout(() => this.animate(), this.currentFrame.duration)
  }

  private animationNameEditor: boolean = false;
  private newName: string;

  @ViewChild('newNameInput') inputEl:ElementRef;

  newAnimation() {
    this.currentAnimation = undefined;
    this.animationNameEditor = true;
    this.changeDetector.detectChanges();
    this.newName = '';
    this.inputEl.nativeElement.focus();
  }

  createAnimation() {
    //todo validate input
    if(this.newName.length < 1) {
      alert("Name is requiered");
      return;
    }
    this.animationNameEditor = false;
    //todo loading animation
    this.http.post("http://192.168.178.231:3000/animation/create", {name: this.newName}).subscribe(res => {
      this.loadAnimations(); //todo use response for list
      
    });
  }

  @HostListener('window:click', ['$event'])
  clickListener(event: MouseEvent) {
    if (event.target instanceof Element) {
      console.log(event.target.id);
      if(event.target.id !== "new-name-input" && event.target.id !== "new-name" && event.target.id !== "new-name-text") {
        this.animationNameEditor = false;
      }
    }
  }


  loadAnimations() {
    this.http.get("http://192.168.178.231:3000/animation/list").subscribe((res: Animation[]) => {
      console.log(res);
      this.animations = Array();
      for(let i = 0; i < res.length; i++) {
        let animation: Animation = new Animation(res[i].name, res[i].animationId, res[i].repeats, res[i].enabled);
        console.log(animation);
        this.animations[this.animations.length] = animation;
      }
    });
  }


  drop(event: CdkDragDrop<string[]>) {
    //TODO implement in backend
    moveItemInArray(this.animations, event.previousIndex, event.currentIndex);
  }

  delete(animation: Animation) {
    if(confirm('Do you really want to delete the animation? This cannot be undone.')) {
      this.http.post("http://192.168.178.231:3000/animation/delete", {id: animation.animationId}).subscribe(res => {
        this.loadAnimations(); //todo use response for list
        this.currentAnimation = undefined;
      });
    }
  }

  changeEnabled(animation: Animation) {
    animation.enabled = !animation.enabled;
    this.http.post("http://192.168.178.231:3000/animation/status", {id: animation.animationId, enabled: animation.enabled}).subscribe(res => {
      this.loadAnimations(); //todo use response for list
    });
  }

  private repeatsTimeout: {[animationId:number]:any} = {};
  updateRepeats(animation: Animation) {
    if(this.repeatsTimeout[animation.animationId]) clearTimeout(this.repeatsTimeout[animation.animationId]);
    this.repeatsTimeout[animation.animationId] = setTimeout(() => {
      this.http.post("http://192.168.178.231:3000/animation/repeats", {id: animation.animationId, repeats: animation.repeats}).subscribe(res => {
      });
    }, 2000);
  }
}
