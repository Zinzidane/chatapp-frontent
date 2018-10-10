import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/services/token.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.css']
})
export class FollowingComponent implements OnInit {
  following = [];
  user: any;

  constructor(private tokenService: TokenService, private usersService: UsersService) { }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.GetUser();
  }

  GetUser() {
    this.usersService.GetUserById(this.user._id).subscribe(data => {
      this.following = data.result.following;
    }, err => {
      console.log(err);
    });
  }
}
