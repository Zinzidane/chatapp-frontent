import { Component, OnInit, AfterViewInit } from '@angular/core';
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
export class MessageComponent implements OnInit, AfterViewInit {
  messageForm: FormGroup;
  receiver: any;
  user: any;
  messages = [];
  socket: any;
  typingMessage;
  typing = false;

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

    this.socket.on('is_typing', data => {
      if(data.sender === this.receiver.username) {
        this.typing = true;
      }
    });

    this.socket.on('has_stopped_typing', data => {
      if(data.sender === this.receiver.username) {
        this.typing = false;
      }
    });
  }

  ngAfterViewInit() {
    const params = {
      room1: this.user.username,
      room2: this.receiver.username
    };

    this.socket.emit('join chat', params);
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

  IsTyping() {
    this.socket.on('start_typing', {
      sender: this.user.username,
      receiver: this.receiver.username
    });

    if(this.typingMessage) {
      clearTimeout(this.typingMessage);
    }

    this.typingMessage = setTimeout(() => {
      this.socket.emit('stop_typing', {
        sender: this.user.username,
        receiver: this.receiver.username
      });
    }, 500);
  }
}
