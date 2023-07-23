import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  constructor(
    private authService : AuthService,
  ) {}

  ngOnInit(): void {
    // nos subscribimos al profile en este punto ya que el layout se ejecuta, una vez se ha hecho el login
    this.authService.profile().subscribe()
  }

}
