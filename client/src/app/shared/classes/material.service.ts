import {ElementRef} from "@angular/core";
import {MaterialDatepicker} from "../interfaces";

declare var M;

export interface MaterialInstance {
  open?(): void,
  close?(): void,
  destroy?(): void
}

export class MaterialService {
  //Pop-up messages
  static toast(message: string) {
    M.toast({html: message})
  }

  //Floating Button
  static initializeFloatingButton(ref: ElementRef) {
    M.FloatingActionButton.init(ref.nativeElement) //to transfer native element to materialize
  }

  // Method to reinitialize all the Materialize labels on the page if you are dynamically adding inputs
  static updateTextInputs() {
    M.updateTextFields();
  }

  // initialize modal window
  static initModal(ref: ElementRef): MaterialInstance {
    return M.Modal.init(ref.nativeElement);
  }
 // initialize tooltips (Tooltips are small, interactive, textual hints for mainly graphical elements.)
  static initTooltip(ref: ElementRef): MaterialInstance {
    return  M.Tooltip.init(ref.nativeElement);
  }

  // initialize date-picker
  static initDatepicker(ref: ElementRef, onClose: () => void): MaterialDatepicker{
    return M.Datepicker.init(ref.nativeElement, {
      format: 'dd.mm.yyyy',
      showClearBtn: true,
      onClose
    });
  }

  // initialize tapTarget
  static initTapTarget(ref: ElementRef): MaterialInstance {
    return M.TapTarget.init(ref.nativeElement);
  }
}
