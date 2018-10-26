import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from '../../services/post.service';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import io from 'socket.io-client';
import _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-top-streams',
  templateUrl: './top-streams.component.html',
  styleUrls: ['./top-streams.component.css']
})
export class TopStreamsComponent implements OnInit, OnDestroy {
  topPosts: any;
  socket: any;
  user: any;
  aSub: Subscription;
  lSub: Subscription;

  constructor(private postService: PostService, private tokenService: TokenService, private router: Router) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.AllPosts();

    this.socket.on('refreshPage', (data) => {
      this.AllPosts();
    });
  }

  ngOnDestroy() {
    this.aSub.unsubscribe();
    this.lSub.unsubscribe();
  }

  AllPosts() {
    this.aSub = this.postService.getAllPosts().subscribe(data => {
      this.topPosts = data.top;
    }, err => {
      if(err.error.token === null) {
        this.tokenService.DeleteToken();
        this.router.navigate(['']);
      }
    });
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  CheckInArray(arr, username) {
    return _.some(arr, {username: username});
  }

  LikePost(post) {
    this.lSub = this.postService.addLike(post).subscribe(data => {
      this.socket.emit('refresh', {});
    }, err => console.log(err));
  }

  OpenCommentBox(post) {
    this.router.navigate(['post', post._id]);
  }

}
