import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../services/token.service';
import * as M from 'materialize-css';

@Component({
  selector: 'app-streams',
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.css']
})
export class StreamsComponent implements OnInit {
  token: any;

  constructor(private tokenService: TokenService) { }

  ngOnInit() {
    this.token = this.tokenService.GetPayload();
    const tabs = document.querySelector('.tabs');
    M.Tabs.init(tabs, {});
  }
}
