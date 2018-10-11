import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TokenService } from 'src/app/services/token.service';
import { MessageService } from 'src/app/services/message.service';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import io from 'socket.io-client';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  messageForm: FormGroup;
  receiver: any;
  user: any;
  messages = [];
  socket: any;

  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService,
    private usersService: UsersService,
    private messageService: MessageService,
    private route: ActivatedRoute) {
      this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.GetUserByUsername(params.name);
    });
    this.user = this.tokenService.GetPayload();
    this.init();

    this.socket.on('refreshPage', () => {
      this.GetUserByUsername(this.receiver.username);
    });
  }

  init() {
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  GetUserByUsername(username) {
    this.usersService.GetUserByName(username).subscribe(data => {
      this.receiver = data.result;

      this.GetMessages(this.user._id, data.result._id);
    });
  }

  GetMessages(senderId, receiverId) {
    this.messageService.GetAllMessages(senderId, receiverId).subscribe(data => {
      this.messages = data.messages.message;
    });
  }

  SendMessage() {
    if (this.messageForm.value.message) {
      this.messageService.SendMessage(this.user._id, this.receiver._id, this.receiver.username, this.messageForm.value.message).subscribe(data => {
        this.socket.emit('refresh', {});
        this.messageForm.reset();
      });
    }
  }
}
