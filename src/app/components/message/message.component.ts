import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TokenService } from 'src/app/services/token.service';
import { MessageService } from 'src/app/services/message.service';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import io from 'socket.io-client';
import { CaretEvent, EmojiEvent, EmojiPickerOptions } from 'ng2-emoji-picker';

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

  public eventMock;
  public eventPosMock;

  public direction = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'top' : 'bottom') : (Math.random() > 0.5 ? 'right' : 'left');
  public toggled = false;
  public content = ' ';

  private _lastCaretEvent: CaretEvent;

  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService,
    private usersService: UsersService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private emojiPickerOptions: EmojiPickerOptions) {
      this.socket = io('http://localhost:3000');
      // this.emojiPickerOptions.setEmojiSheet({
      //   url: 'sheet_apple_32.png',
      //   locator: EmojiPickerAppleSheetLocator
      // });
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

  Toggled() {
    this.toggled = !this.toggled;
  }

  HandleSelection(event: EmojiEvent) {
    this.content = this.content.slice(0, this._lastCaretEvent.caretOffset) + event.char + this.content.slice(this._lastCaretEvent.caretOffset);
    this.eventMock = JSON.stringify(event);

    this.messageForm.value.message = this.content;

    this.toggled = !this.toggled;
    // Clear emoji
    this.content = '';
  }

  HandleCurrentCaret(event: CaretEvent) {
    this._lastCaretEvent = event;
    this.eventPosMock = `{ caretOffset : ${event.caretOffset}, caretRange: Range{...}, textContent: ${event.textContent} }`;
  }
}
