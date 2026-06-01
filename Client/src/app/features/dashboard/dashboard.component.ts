import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LogService, LogEntry, AIInsight } from '../../core/services/log.service';
import { InsightModalComponent } from '../insight-modal/insight-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, InsightModalComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private logService = inject(LogService);
  private destroyRef = inject(DestroyRef);

  // Core Reactive States managed via Signals
  public logs = signal<LogEntry[]>([]);
  public searchTerm = signal<string>('');
  public selectedSeverity = signal<string>('ALL');
  
  // Dialog Overlay Control States
  public isModalOpen = signal<boolean>(false);
  public activeInsight = signal<AIInsight | null>(null);

  // High-performance derivation engine completely removing template-function processing performance drains
  public filteredLogs = computed(() => {
    return this.logs().filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(this.searchTerm().toLowerCase()) || 
                            log.metadata.host.toLowerCase().includes(this.searchTerm().toLowerCase());
      const matchesSeverity = this.selectedSeverity() === 'ALL' || log.metadata.severity === this.selectedSeverity();
      return matchesSearch && matchesSeverity;
    });
  });

  ngOnInit(): void {
    // Pipeline subscribing to Socket.io pushes safely unbinding via modern DestroyRef interop
    this.logService.getLiveLogs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(newLogs => {
        // Prepend new arrivals maintaining a live rolling dashboard viewport window
        this.logs.update(current => [...newLogs, ...current].slice(0, 200));
      });

    this.logService.getLiveInsights()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(alert => {
        console.log(`💡 AI Diagnostic Generated for Log Reference ID: ${alert.logId}`);
      });
  }

  public updateSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  public filterBySeverity(severity: string): void {
    this.selectedSeverity.set(severity);
  }

  public inspectLogDiagnostics(logId: string): void {
    this.logService.fetchInsight(logId).subscribe({
      next: (insight) => {
        this.activeInsight.set(insight);
        this.isModalOpen.set(true);
      },
      error: () => {
        alert('No predictive diagnostics compiled for this stack tracing baseline.');
      }
    });
  }
}