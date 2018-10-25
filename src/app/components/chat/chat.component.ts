import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import io from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  tabElement: any;
  onlineUsersArr = [];
  socket: any;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.tabElement = document.querySelector('.nav-content');
  }

  ngAfterViewInit() {
    this.tabElement.style.display = 'none';
    this.socket.on('usersOnline', (data) => {
      this.onlineUsersArr = data;
    });
  }

  ngOnDestroy() {
    this.tabElement.style.display = 'block';
  }

  online(event) {
    this.onlineUsersArr = event;
  }
}
