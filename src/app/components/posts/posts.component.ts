import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { PostService } from '../../services/post.service';
import * as moment from 'moment';
import io from 'socket.io-client';
import _ from 'lodash';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload';

const STEP = 2;
const URL = 'http://localhost:3000/api/chatapp/upload-image';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit, OnDestroy, OnChanges {
  uploader: FileUploader = new FileUploader({
    url: URL,
    disableMultipart: true
  });
  socket: any;
  posts = [];
  user: any;
  offset = 0;
  limit = STEP;
  loading = false;
  reloading = false;
  noMorePosts = false;
  pSub: Subscription;
  lSub: Subscription;
  postForm: FormGroup;
  selectedFile: any;
  submitSub: Subscription;
  getPostsSub: Subscription;

  constructor(private postService: PostService, private tokenService: TokenService, private router: Router,private fb: FormBuilder) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.reloading = true;
    this.init();

    // Get user for later usage in CheckInLikesArray
    this.user = this.tokenService.GetPayload();
    this.AllPosts();

    this.socket.on('refreshPage', (data) => {
      this.AllPosts();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes.prop);
  }

  ngOnDestroy() {
    if(this.pSub) {
      this.pSub.unsubscribe();
    }

    if(this.lSub) {
      this.lSub.unsubscribe();
    }

    if(this.submitSub) {
      this.submitSub.unsubscribe();
    }

    if(this.getPostsSub) {
      this.getPostsSub.unsubscribe();
    }
  }

  init() {
    this.postForm = this.fb.group({
      post: ['', Validators.required]
    });
  }

  SubmitPost() {
    let body;
    if(!this.selectedFile) {
      body = {
        post: this.postForm.value.post
      };
    } else {
      body = {
        post: this.postForm.value.post,
        image: this.selectedFile
      };
    }
    this.submitSub = this.postService.addPost(body).subscribe(data => {
      this.socket.emit('refresh', {});
      this.postForm.reset();
      if(this.selectedFile) {
        this.selectedFile = null;
      }
    });
  }

  onFileSelected(event) {
    const file: File = event[0];

    this.ReadAsBase64(file)
      .then(result => this.selectedFile = result)
      .catch(err => console.log(err));
  }

  ReadAsBase64(file): Promise<any> {
    const reader = new FileReader();
    const fileValue = new Promise((resolve, reject) => {
      reader.addEventListener('load', () => {
        resolve(reader.result);
      });

      reader.addEventListener('error', (event) => {
        reject(event);
      });

      reader.readAsDataURL(file);
    });
    return fileValue;
  }

  AllPosts() {
    this.reloading = true;
    this.loading = true;
    const params = {
      offset: this.offset,
      limit: this.limit
    };
    this.pSub = this.postService.getAllPosts(params).subscribe(data => {
      this.loading = false;
      this.reloading = false;
      this.posts = this.posts.concat(data.posts);
      this.noMorePosts = data.posts.length < STEP;
    }, err => {
      this.loading = false;
      this.reloading = false;
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
      console.log(data);
    }, err => console.log(err));
  }

  OpenCommentBox(post) {
    this.router.navigate(['post', post._id]);
  }
}
