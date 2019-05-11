import { Component, OnInit } from '@angular/core';
import { Animation } from '../obj/animation';
import { HttpClient } from '@angular/common/http';

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
  }


  selectAnimation(animation: Animation) {
    this.currentAnimation = animation;
  }

  new() {
    this.currentAnimation = undefined;
  }

  loadAnimations() {
    this.http.get("http://192.168.178.231:3000/animation/list").subscribe((res: Animation[]) => {
      console.log(res);
      this.animations = Array();
        for(let i = 0; i < res.length; i++) {
          let animation: Animation = new Animation(res[i].name, res[i].animationId);
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
    this.http.post("http://192.168.178.231:3000/animation/create", {name: this.animationName}).subscribe(res => {
      this.loadAnimations(); //todo use response for list
    });
  }
}
