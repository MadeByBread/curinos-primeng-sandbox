import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

import { PhIconWeight, phIconAssetPath } from '../icons/phosphor-icons';

@Component({
  selector: 'app-ph-icon',
  templateUrl: './ph-icon.component.html',
  styleUrls: ['./ph-icon.component.scss']
})
export class PhIconComponent implements OnInit, OnChanges {
  @Input() name: string;
  @Input() size: string;
  @Input() weight: PhIconWeight = 'regular';
  @Input() ariaLabel: string;
  @Input() ariaHidden = true;

  svgContent: SafeHtml;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadIcon();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.name || changes.weight) {
      this.loadIcon();
    }
  }

  get sizeValue(): string {
    return this.size || 'var(--curinos-dimensions-controls-sizing-sm)';
  }

  private loadIcon(): void {
    if (!this.name) {
      this.svgContent = null;
      return;
    }

    const path = phIconAssetPath(this.name, this.weight);
    this.http.get(path, { responseType: 'text' }).subscribe(
      svg => {
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
      },
      () => {
        this.svgContent = null;
      }
    );
  }
}
