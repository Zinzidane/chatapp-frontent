import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import * as M from 'materialize-css';
import { UsersService } from 'src/app/services/users.service';
import * as moment from 'moment';
import io from 'socket.io-client';
import _ from 'lodash';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, AfterViewInit {
  @Output() onlineUsers = new EventEmitter();
  user: any;
  notifications = [];
  socket: any;
  count = [];
  chatList = [];
  msgNumber = 0;

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private usersService: UsersService,
    private msgService: MessageService
  ) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();

    this.GetUser();

    const dropdownElement = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(dropdownElement, {
      alignment: 'right',
      hover: true,
      coverTrigger: false
    });

    const dropdownElementTwo = document.querySelectorAll('.dropdown-trigger1');
    M.Dropdown.init(dropdownElementTwo, {
      alignment: 'right',
      hover: true,
      coverTrigger: false
    });

    this.socket.emit('online', {room: 'global', user: this.user.username});

    this.socket.on('refreshPage', () => {
      this.GetUser();
    });
  }

  ngAfterViewInit() {
    this.socket.on('usersOnline', (data) => {
      this.onlineUsers.emit(data);
    });
  }

  GetUser() {
    this.usersService.GetUserById(this.user._id).subscribe(data => {
      this.notifications = data.result.notifications.reverse();
      const value = _.filter(this.notifications, ['read', false]);
      this.count = value;
      this.chatList = data.result.chatList;

      this.CheckIfRead(this.chatList);
    }, err => {
      if(err.error.token === null) {
        this.tokenService.DeleteToken();
        this.router.navigate(['']);
      }
    });
  }

  logout() {
    this.tokenService.DeleteToken();
    this.router.navigate(['/']);
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  GoToHome() {
    this.router.navigate(['streams']);
  }

  GoToChatPage(name) {
    this.router.navigate(['chat', name]);
    this.msgService.MarkMessages(this.user.username, name).subscribe(data => {
      this.socket.emit('refresh', {});
    });
  }

  MarkAll() {
    this.usersService.MarkAllAsRead().subscribe(data => {
      this.socket.emit('refresh', {});
    });
  }

  MarkAllMessages() {
    this.msgService.MarkAllMessages().subscribe(data => {
      this.socket.emit('refresh', {});
      this.msgNumber = 0;
    });
  }

  CheckIfRead(arr) {
    const checkArr = [];

    for(let i = 0;i < arr.length; i++) {
      const receiver = arr[i].msgId.message[arr[i].msgId.message.length - 1];

      // Check if user is not on chat page
      if(this.router.url !== `/chat/${receiver.senderName}`) {
        if(receiver.isRead === false && receiver.receiverName === this.user.username) {
          checkArr.push(1);
          this.msgNumber = _.sum(checkArr);
        }
      }
    }
  }

  MessageDate(date) {
    return moment(date).calendar(null, {
      sameDay: '[Today]',
      lastDay: '[Yesterday]',
      lastWeek: 'DD/MM/YYYY',
      sameElse: 'DD/MM/YYYY'
    });
  }
}
