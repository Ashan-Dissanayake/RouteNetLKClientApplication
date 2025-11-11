import {Component, DoCheck, ElementRef, Input, OnDestroy, OnInit, Optional, Self, ViewChild} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {MatError, MatFormFieldControl} from '@angular/material/form-field';
import {FocusMonitor} from '@angular/cdk/a11y';
import {Subject} from 'rxjs';
import {MatCard} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-file-picker',
  templateUrl: './file-picker.component.html',
  styleUrls: ['./file-picker.component.scss'],
  standalone: true,
  imports: [MatCard, MatIcon, MatButton, NgIf, MatError],
  providers: [
    { provide: MatFormFieldControl, useExisting: FilePickerComponent }
  ]
})
export class FilePickerComponent
  implements ControlValueAccessor, MatFormFieldControl<any>, OnInit, DoCheck, OnDestroy {

  /** Angular Material form field props */
  static nextId = 0;
  stateChanges = new Subject<void>();
  controlType = 'app-file-picker';
  id = `app-file-picker-${FilePickerComponent.nextId++}`;
  describedBy = '';
  focused = false;
  errorState = false;
  disableAutomaticLabeling = false;
  errorMessage: string | null = null;


  /** Inputs */
  @Input() placeholder = 'Select a file';
  @Input() required = false;
  @Input() disabled = false;
  @Input() defaultImage?: string;
  @Input() showPdfDetails = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /** File state */
  imageURL?: string;
  pdfUrl?: string;
  pdfFileName = '';
  isPDF = false;
  viewPdf = false;

  /** Form value */
  private _value = '';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private fm: FocusMonitor,
    private elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl) this.ngControl.valueAccessor = this;
    this.fm.monitor(this.elementRef, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  // ========== Material Control ==========
  get value(): any {
    return this._value;
  }

  set value(val: any) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
      this.stateChanges.next();
    }
  }

  get empty(): boolean {
    return !this.imageURL && !this.isPDF;
  }

  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(): void {
    if (this.disabled) return;
    this.fileInput.nativeElement.value = ''; // ensure same file triggers change
    this.fileInput.nativeElement.click();
  }

  // ========== Lifecycle ==========
  ngOnInit(): void {
    if (this.defaultImage) this.imageURL = this.defaultImage;
  }

  ngDoCheck(): void {
    const control = this.ngControl?.control;
    this.errorState = !!(control && control.invalid && control.dirty);
    this.stateChanges.next();
  }

  ngOnDestroy(): void {
    if (this.pdfUrl) URL.revokeObjectURL(this.pdfUrl);
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elementRef);
  }

  // ========== ControlValueAccessor ==========
  writeValue(value: any): void {
    if (!value) {
      this.resetToDefault();
      return;
    }

    try {
      const decoded = atob(value);
      const bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i);
      }

      // check if PDF by magic number
      const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;

      if (isPdf) {
        this.loadPdfFromBytes(bytes);
      } else {
        this.imageURL = 'data:image/png;base64,' + value;
        this.isPDF = false;
        this.viewPdf = false;
      }
    } catch {
      this.resetToDefault();
    }

    this.stateChanges.next();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.stateChanges.next();
  }

  // ========== File Handling ==========
  selectImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset errors and previous file state
    this.errorMessage = null;
    this.errorState = false;
    this.stateChanges.next();

    // ✅ Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.errorMessage = 'File size exceeds the 10MB limit.';
      this.errorState = true;
      this.stateChanges.next();
      return;
    }

    const reader = new FileReader();

    if (file.type === 'application/pdf') {
      if (this.pdfUrl) URL.revokeObjectURL(this.pdfUrl);
      this.pdfFileName = file.name;

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const binaryString = e.target?.result as string;
          this.value = btoa(binaryString);
          const blob = new Blob([binaryString], { type: 'application/pdf' });
          this.pdfUrl = URL.createObjectURL(blob);
          this.isPDF = true;
          this.showPdfDetails = true;
          this.viewPdf = true;
          this.imageURL = undefined;
        } catch {
          this.errorMessage = 'Error processing PDF file.';
          this.errorState = true;
        }
        this.stateChanges.next();
      };

      reader.onerror = () => {
        this.errorMessage = 'Error reading PDF file.';
        this.errorState = true;
        this.stateChanges.next();
      };

      reader.readAsBinaryString(file);
    } else {
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const dataUrl = e.target?.result as string;
          this.imageURL = dataUrl;
          this.value = dataUrl.split(',')[1]; // base64 only
          this.isPDF = false;
          this.viewPdf = false;
        } catch {
          this.errorMessage = 'Error processing image file.';
          this.errorState = true;
        }
        this.stateChanges.next();
      };

      reader.onerror = () => {
        this.errorMessage = 'Error reading image file.';
        this.errorState = true;
        this.stateChanges.next();
      };

      reader.readAsDataURL(file);
    }
  }


  clearImage(): void {
    this.resetToDefault();
    this.onChange('');
  }

  private resetToDefault(): void {
    this.imageURL = this.defaultImage || '';
    this.isPDF = false;
    this.viewPdf = false;
    this.pdfFileName = '';
    if (this.pdfUrl) URL.revokeObjectURL(this.pdfUrl);
    this.pdfUrl = undefined;
  }

  private loadPdfFromBytes(bytes: any): void {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    this.pdfUrl = URL.createObjectURL(blob);
    this.isPDF = true;
    this.showPdfDetails = true;
    this.viewPdf = true;
    this.imageURL = undefined;
  }

  protected readonly event = event;
}
