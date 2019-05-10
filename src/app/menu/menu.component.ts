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
    this.http.get("http://192.168.178.231:3000/animation/list").subscribe(res => {
      console.log(res);
      if(res['animations'] !== undefined) {
        for(let i = 0; i < res['animations'].length; i++) {
          let animation: Animation = new Animation(res['animations'][i].title, res['animations'][i].id);
          this.animations[this.animations.length] = animation;
        }
      } 
    });
  }


  selectAnimation(animation: Animation) {
    this.currentAnimation = animation;
  }

  new() {
    this.currentAnimation = undefined;
  }
}
