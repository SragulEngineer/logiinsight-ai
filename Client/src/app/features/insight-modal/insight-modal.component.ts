import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AIInsight } from '../../core/services/log.service';

@Component({
  selector: 'app-insight-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insight-modal.component.html'
})
export class InsightModalComponent {
  @Input() isOpen: boolean = false;
  @Input() insight: AIInsight | null = null;
  @Output() closeModal = new EventEmitter<void>();
}