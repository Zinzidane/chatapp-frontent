import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import _ from 'lodash';
import { TokenService } from 'src/app/services/token.service';
import io from 'socket.io-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit, AfterViewInit {
  socket: any;
  users = [];
  loggedInUser: any;
  userArr = [];
  onlineUsersArr = [];

  constructor(private userService: UsersService, private tokenService: TokenService, private router: Router) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.loggedInUser = this.tokenService.GetPayload();
    this.GetUsers();
    this.GetUser();

    this.socket.on('refreshPage', () => {
      this.GetUsers();
      this.GetUser();
    });
  }

  ngAfterViewInit() {
    this.socket.on('usersOnline', (data) => {
      this.onlineUsersArr = data;
    });
  }

  GetUsers() {
    this.userService.GetAllUsers().subscribe(data => {
      _.remove(data.result, {username: this.loggedInUser.username});
      this.users = data.result;
    }, err => console.log(err));
  }

  GetUser() {
    this.userService.GetUserById(this.loggedInUser._id).subscribe(data => {
      this.userArr = data.result.following;
    }, err => console.log(err));
  }

  FollowUser(user) {
    this.userService.FollowUser(user._id).subscribe(data => {
      this.socket.emit('refresh', {});
    });
  }

  CheckInArray(arr, id) {
    const result = _.find(arr, ['userFollowed._id', id]);
    if(result) {
      return true;
    } else {
      return false;
    }
  }

  // online(event) {
  //   this.onlineUsersArr = event;
  // }

  CheckIfOnline(name) {
    const result = _.indexOf(this.onlineUsersArr, name);
    if(result > -1) {
      return true;
    } else {
      return false;
    }
  }

  ViewUser(user) {
    this.router.navigate([user.username]);
    if(this.loggedInUser.username !== user.username) {
      this.userService.ProfileNotifications(user._id).subscribe(data => {
        this.socket.emit('refresh', {});
      }, err => console.log(err));
    }
  }
}
