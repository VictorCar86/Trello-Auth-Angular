import { Component, Input } from '@angular/core';
import { Colors, COLORS } from '@models/colors.model';

@Component({
  selector: 'app-card-color',
  templateUrl: './card-color.component.html'
})
export class CardColorComponent {
  @Input() color: Colors = 'sky';

  mapColors = COLORS;

  constructor() {}

  get colors() {
    const colors = this.mapColors[this.color];
    if (colors) {
      return colors;
    }
    return {};
  }
}
