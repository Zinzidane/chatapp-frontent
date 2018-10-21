import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/services/token.service';
import { UsersService } from 'src/app/services/users.service';
import io from 'socket.io-client';
import * as moment from 'moment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  socket: any;
  user: any;
  notifications = [];

  constructor(private tokenService: TokenService, private usersService: UsersService) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.GetUser();
    this.socket.on('refreshPage', () => {
      this.GetUser();
    });
  }

  GetUser() {
    this.usersService.GetUserById(this.user._id).subscribe(data => {
      this.notifications = data.result.notifications.reverse();
      console.log(this.notifications);
    });
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  MarkNotification(notification) {
    this.usersService.MarkNotification(notification._id).subscribe(data => {
      this.socket.emit('refresh', {});
    });
  }

  DeleteNotification(notification) {
    this.usersService.MarkNotification(notification._id, true).subscribe(data => {
      this.socket.emit('refresh', {});
    });
  }
}
