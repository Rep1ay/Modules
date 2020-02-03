import { Component } from '@angular/core';
import { DataService } from './data.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  value;
  valueFrom;
  valueTo;
  elseBlock;
  centered = true;
  disabled = false;
  unbounded = false;
  showWinnersElse = false;
  radius: 50;
  color: string;
  showLoader = true;
  winnersList = [];
  membersList = [];


  constructor(private watchersService: DataService) {}

  ngOnInit() {
    this.getMembers();
  }

  getMembers(){
    this.watchersService.getData()
    .subscribe(res => {
      this.showLoader = false;
      res.forEach(watcher => {
        this.membersList.push(watcher);
      })
    })
  }

}
