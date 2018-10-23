import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as M from 'materialize-css';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.css']
})
export class ViewUserComponent implements OnInit, AfterViewInit {
  tabElement: any;
  postsTab = false;
  followingTab = false;
  followersTab = false;

  constructor() { }

  ngOnInit() {
    this.postsTab = true;
    const tabs = document.querySelector('.tabs');
    M.Tabs.init(tabs, {});
    this.tabElement = document.querySelector('.nav-content');
  }

  ngAfterViewInit() {
    this.tabElement.style.display = 'none';
  }

  ChangeTab(value) {
    if (value === 'posts') {
      this.postsTab = true;
      this.followingTab = false;
      this.followersTab = false;
    }

    if (value === 'following') {
      this.postsTab = false;
      this.followingTab = true;
      this.followersTab = false;
    }

    if (value === 'followers') {
      this.postsTab = false;
      this.followingTab = false;
      this.followersTab = true;
    }
  }

}
