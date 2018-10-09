import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PostService } from 'src/app/services/post.service';
import { ActivatedRoute } from '@angular/router';
import io from 'socket.io-client';
import * as moment from 'moment';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit, AfterViewInit {
  toolbarElement: any;
  socket: any;
  commentForm: FormGroup;
  postId: any;
  commentsArray = [];

  constructor(private fb: FormBuilder, private postService: PostService, private route: ActivatedRoute) {
    this.socket = io('http://localhost:3000')
  }

  ngOnInit() {
    this.toolbarElement = document.querySelector('.nav-content');
    this.postId = this.route.snapshot.paramMap.get('id');
    this.init();

    this.GetPost();
    this.socket.on('refreshPage', data => {
      this.GetPost();
    });
  }

  ngAfterViewInit() {
    this.toolbarElement.style.display = 'none';
  }

  init() {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  AddComment() {
    this.postService.addComment(this.postId, this.commentForm.value.comment).subscribe(data => {
      this.socket.emit('refresh', {});
      this.commentForm.reset();
    }, err => console.log(err));
  }

  GetPost() {
    this.postService.getPost(this.postId).subscribe(data => {
      this.commentsArray = data.post.comments.reverse();
    })
  }
}
