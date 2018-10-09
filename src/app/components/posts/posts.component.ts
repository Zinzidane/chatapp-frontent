import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import * as moment from 'moment';
import io from 'socket.io-client';
import _ from 'lodash';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
  socket: any;
  posts = [];
  user: any;

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

  AllPosts() {
    this.postService.getAllPosts().subscribe(data => {
      this.posts = data.posts;
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
    this.postService.addLike(post).subscribe(data => {
      this.socket.emit('refresh', {});
    }, err => console.log(err));
  }

  OpenCommentBox(post) {
    this.router.navigate(['post', post._id]);
  }
}
