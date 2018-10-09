import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PostService } from 'src/app/services/post.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit, AfterViewInit {
  toolbarElement: any;
  commentForm: FormGroup;
  postId: any;
  commentsArray = [];

  constructor(private fb: FormBuilder, private postService: PostService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.toolbarElement = document.querySelector('.nav-content');
    this.postId = this.route.snapshot.paramMap.get('id');
    this.init();

    this.GetPost();
  }

  ngAfterViewInit() {
    this.toolbarElement.style.display = 'none';
  }

  init() {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  AddComment() {
    this.postService.addComment(this.postId, this.commentForm.value.comment).subscribe(data => {
      this.commentForm.reset();
    }, err => console.log(err));
  }

  GetPost() {
    this.postService.getPost(this.postId).subscribe(data => {
      this.commentsArray = data.post.comments;
    })
  }
}
