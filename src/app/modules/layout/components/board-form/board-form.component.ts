import { Colors } from '@models/colors.model';
import { BoardsService } from './../../../../services/boards.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, EventEmitter, Output } from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board-form',
  templateUrl: './board-form.component.html',
})
export class BoardFormComponent {

  @Output() showOverlay = new EventEmitter<boolean>();

  faCheck = faCheck;
  form = this.formBuilder.nonNullable.group({
    title: [''],
    backgroundColor: new FormControl<Colors>('sky', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    private formBuilder: FormBuilder,
    private boardsService: BoardsService,
    private router: Router
  ) {}

  doSave() {
    if (this.form.valid) {
      const { title, backgroundColor } = this.form.getRawValue();
      this.boardsService.createBoard(title, backgroundColor)
        .subscribe((board) => {
          this.showOverlay.next(false);
          this.router.navigate(['/app/boards', board.id]);
        });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
