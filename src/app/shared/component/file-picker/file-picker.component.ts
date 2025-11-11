import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ElementRef,
  DoCheck, ViewChild
} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {MatFormFieldControl} from '@angular/material/form-field';
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
  imports: [MatCard, MatIcon, MatButton, NgIf],
  providers: [
    { provide: MatFormFieldControl, useExisting: FilePickerComponent }
  ]
})
export class FilePickerComponent
  implements
    ControlValueAccessor,
    MatFormFieldControl<any>,
    OnInit,
    DoCheck,
    OnDestroy {

  /** Angular Material form control state */
  static nextId = 0;
  stateChanges = new Subject<void>();
  focused = false;
  controlType = 'app-file-picker';
  id = `app-file-picker-${FilePickerComponent.nextId++}`;
  describedBy = '';

  /** Required new Material props */
  errorState = false;
  autofilled?: boolean;
  userAriaDescribedBy?: string;
  disableAutomaticLabeling = false;

  /** Inputs */
  @Input() placeholder: string = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() defaultImage: any;
  @Input() showPdfDetails!: boolean;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;


  /** File handling */
  imageURL: any;
  pdfFileName: string = '';
  isPDF: boolean = false;
  viewPdf: boolean = false;
  private convertValue: string = '';
  private decodeValue!: any;
  public pdfUrl!: any;

  /** Max file size of 10MB */
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  constructor(
    private fm: FocusMonitor,
    private elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    this.fm.monitor(this.elementRef, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  // MatFormFieldControl interface implementation
  get value(): any {
    return this.convertValue;
  }

  set value(val: any) {
    if (val !== this.convertValue) {
      this.convertValue = val;
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

    // Reset so same file can be chosen again
    this.fileInput.nativeElement.value = '';

    // Trigger file chooser (one-click guaranteed)
    this.fileInput.nativeElement.click();
  }


  ngOnInit() {}

  ngDoCheck(): void {
    if (this.ngControl) {
      const control = this.ngControl.control;
      this.errorState = !!(control && control.invalid && (control.dirty));
    }
    this.stateChanges.next();
  }

  ngOnDestroy(): void {
    if (this.pdfUrl) URL.revokeObjectURL(this.pdfUrl);
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elementRef);
  }

  // ControlValueAccessor interface implementation
  writeValue(value: any): void {
    if (!value) {
      this.imageURL = this.defaultImage;
    } else {
      try {
        this.decodeValue = atob(value);

        const byteCharacters = new Uint8Array(this.decodeValue.length);
        for (let i = 0; i < this.decodeValue.length; i++) {
          byteCharacters[i] = this.decodeValue.charCodeAt(i);
        }

        const pdfSignature = byteCharacters.slice(0, 4);
        const isPDF =
          pdfSignature[0] === 0x25 &&
          pdfSignature[1] === 0x50 &&
          pdfSignature[2] === 0x44 &&
          pdfSignature[3] === 0x46;

        if (isPDF) {
          const blob = new Blob([byteCharacters], { type: 'application/pdf' });
          this.pdfUrl = URL.createObjectURL(blob);
          this.isPDF = true;
          this.showPdfDetails = true;
          this.viewPdf = true;
          this.pdfFileName = '';
        } else {
          this.isPDF = false;
          this.showPdfDetails = false;
          this.imageURL = this.decodeValue;
        }
      } catch (error) {
        console.error('Error decoding Base64 value or handling file:', error);
        this.imageURL = this.defaultImage;
      }
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

  // File Selection Logic
  selectImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // File size validation
    if (file.size > this.MAX_FILE_SIZE) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    const reader = new FileReader();

    if (file.type === 'application/pdf') {
      // --- Handle PDF ---
      if (this.pdfUrl) URL.revokeObjectURL(this.pdfUrl);

      this.isPDF = true;
      this.showPdfDetails = true;
      this.pdfFileName = file.name;

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const binaryString = e.target?.result as string;
        this.convertValue = btoa(binaryString);
        this.onChange(this.convertValue);

        const blob = new Blob([binaryString], { type: 'application/pdf' });
        this.pdfUrl = URL.createObjectURL(blob);
        this.viewPdf = true;
      };

      reader.readAsBinaryString(file);
    } else {
      // --- Handle Image ---
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const dataUrl = e.target?.result as string;
        this.imageURL = dataUrl;
        this.convertValue = dataUrl.split(',')[1]; // Store only base64
        this.onChange(this.convertValue);
        this.isPDF = false;
        this.viewPdf = false;
      };

      reader.readAsDataURL(file);
    }
  }


  clearImage(): void {
    this.imageURL = this.defaultImage;
    this.isPDF = false;
    this.viewPdf = false;
    this.onChange(btoa(this.imageURL));
    this.stateChanges.next();
  }
}
