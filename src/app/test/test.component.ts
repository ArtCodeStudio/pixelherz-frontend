import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatrixCell } from './matrix-cell';
import { sendRequest } from 'selenium-webdriver/http';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  private cells: MatrixCell[];

  constructor(private http: HttpClient) {
    this.cells = Array(64); 
    for(let i = 0; i < 64; i++) {
      this.cells[i] = new MatrixCell(i, false);
    }
  }

  ngOnInit() {
  }

  toggle(cell: MatrixCell) {
    cell.value = !cell.value;
    console.log(cell);
    this.sendRequest();
  }


  sendRequest() {
    console.log("abc");
    let request = Array(64);
    for(let i = 0; i < 64; i++) {
      if(this.cells[i].value) {
        request[i] = [255,255,255];
      } else {
        request[i] = [0,0,0];
      }
    }
    this.http.post("http://192.168.178.231:3000/test/", {pixels:request}).subscribe(res => {
      console.log(res);
    });
  }

}
