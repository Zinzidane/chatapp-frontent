import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from '../../services/post.service';
import * as moment from 'moment';
import io from 'socket.io-client';
import _ from 'lodash';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

const STEP = 2

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit, OnDestroy {
  socket: any;
  posts = [];
  user: any;
  offset = 0;
  limit = STEP;
  noMoreOrders = false;
  pSub: Subscription;
  lSub: Subscription;

  constructor(private postService: PostService, private tokenService: TokenService, private router: Router) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    // Get user for later usage in CheckInLikesArray
    this.user = this.tokenService.GetPayload();
    this.AllPosts();

    this.socket.on('refreshPage', (data) => {
      this.AllPosts();
    });
  }

  ngOnDestroy() {
    if(this.pSub) {
      this.pSub.unsubscribe();
    }

    if(this.lSub) {
      this.lSub.unsubscribe();
    }
  }

  AllPosts() {
    const params = {
      offset: this.offset,
      limit: this.limit
    };
    this.pSub = this.postService.getAllPosts(params).subscribe(data => {
      this.posts = this.posts.concat(data.posts);
      this.noMoreOrders = data.posts.length < STEP
    }, err => {
      if(err.error.token === null) {
        this.tokenService.DeleteToken();
        this.router.navigate(['']);
      }
    });
  }

  LoadMore() {
    this.offset += STEP;
    this.AllPosts();
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
