import { NAVBARBACKGROUND, Colors } from '@models/colors.model';
import { BoardsService } from './../../../../services/boards.service';
import { AuthService } from '@services/auth.service';
import { Component, OnInit } from '@angular/core';
import {
  faBell,
  faInfoCircle,
  faClose,
  faAngleDown
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { MeService } from '@services/me.service';
import { Board } from '@models/board.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  faBell = faBell;
  faInfoCircle = faInfoCircle;
  faClose = faClose;
  faAngleDown = faAngleDown;

  isOpenOverlayAvatar = false;
  isOpenOverlayBoards = false;
  isOpenOverlayCreateBoards = false;
  isOpenNavbarMobile = false;

  boards: Board[] =[];
  user$= this.authService.user$;
  avatar= '/assets/svg/no-avatar.png';
  bgColor: Colors = 'sky';
  background = NAVBARBACKGROUND;

  constructor(
    private authService: AuthService,
    private router: Router,
    private boardsService : BoardsService,
    private meService: MeService
  ) {}

  ngOnInit(): void {
    this.boardsService.backgroundColor$.subscribe(color => this.bgColor = color);
    this.getMeBoards();
  }

  private getMeBoards(){
    this.meService.getMeBoards().subscribe(boards =>{
      this.boards = boards;
    })
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  close(event: boolean){
    this.isOpenOverlayCreateBoards = event;
  }

  toggleNavbarMobile(){
    this.isOpenNavbarMobile = !this.isOpenNavbarMobile;
  }

  get colors(){
    const classes = this.background[this.bgColor];
    return classes ? classes : {};
  }

}
