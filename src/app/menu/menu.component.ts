import { Component, OnInit } from '@angular/core';
import { Animation } from '../obj/animation';
import { HttpClient } from '@angular/common/http';
import { Frame } from '../obj/frame';
import { MatrixCell } from '../obj/matrix-cell';
import { ReturnStatement } from '@angular/compiler';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  public animations: Animation[];
  public currentAnimation: Animation;

  constructor(private http: HttpClient) { }

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
        console.log("empty");
      }
    });
  }

  private index: number;

  animate() {
    if(this.frames == undefined || this.frames.length == 0) {
      setTimeout(() => this.animate(), 100)
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

  new() {
    this.currentAnimation = undefined;
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

  private animationName: string;

  createAnimation() {
    //todo validate input
    this.http.post("http://192.168.178.231:3000/animation/create", {name: this.animationName}).subscribe(res => {
      this.loadAnimations(); //todo use response for list
    });
  }


  delete() {
    //todo validate input
    this.http.post("http://192.168.178.231:3000/animation/delete", {id: this.currentAnimation.animationId}).subscribe(res => {
      this.loadAnimations(); //todo use response for list
    });
  }

  changeEnabled(animation: Animation) {
    console.log(animation.enabled);
    animation.enabled = !animation.enabled;
    console.log(animation.enabled);
    this.http.post("http://192.168.178.231:3000/animation/status", {id: animation.animationId, enabled: animation.enabled}).subscribe(res => {
      this.loadAnimations(); //todo use response for list
    });
  }
}
