import {notes} from '../notes.js';

export let NoteField = function (text) {
    NoteField.superClass_.constructor.call(this, text);
    this.setSpellcheck(false);
};
Blockly.utils.object.inherits(NoteField, Blockly.FieldTextInput);

NoteField.NOTES = notes.map(n => n[0]);

NoteField.prototype.editorListeners_ = [];

NoteField.prototype.showEditor_ = function () {
    NoteField.superClass_.showEditor_.call(this);

    let div = Blockly.WidgetDiv.getDiv();
    if (!div.firstChild) {
        return;
    }
    let editor = this.dropdownCreate_();
    Blockly.DropDownDiv.getContentDiv().appendChild(editor);

    Blockly.DropDownDiv.setColour(this.sourceBlock_.style.colourPrimary,
        this.sourceBlock_.style.colourTertiary);

    Blockly.DropDownDiv.showPositionedByField(
        this, this.dropdownDispose_.bind(this));

    this.updateGraph_();
};

NoteField.prototype.dropdownCreate_ = function () {

    let keySelectedListener = (el) => {
        let value = "";
        if (el.target.id === "") {
            // clicked on a label; return the parent
            value = el.target.parentNode.id;
        } else {
            value = el.target.id;
        }
        this.setEditorValue_(NoteField.NOTES.indexOf(value));
    }

    let highlightMiniMap = (el) => {
        this.imageElement_.querySelectorAll("a").forEach((child) => {
            child.className = "";
        });
        el.className = el.className + " selected";
    }

    let onScrolledListener = (el) => {
        let minimap = this.imageElement_.querySelectorAll("a");
        if (el.target.scrollLeft <= 225) highlightMiniMap(minimap[0]);
        if (el.target.scrollLeft > 225 && el.target.scrollLeft <= 675) highlightMiniMap(minimap[1]);
        if (el.target.scrollLeft > 675 && el.target.scrollLeft <= 1125) highlightMiniMap(minimap[2]);
        if (el.target.scrollLeft > 1125) highlightMiniMap(minimap[3]);
    }

    let createMiniMapOctave = (octave) => {
        let link = document.createElement('a')
        link.setAttribute('href', `#octave-${octave}-${octave + 1}`);
        link.innerText = `${octave}-${octave + 1}`;
        link.setAttribute('ondragstart', 'return false;');
        return link;
    }

    let createKey = (isWhite, note, octave) => {
        let key = document.createElement('li');
        key.id = `${note}${octave}`;
        if (isWhite) {
            key.className = 'whiteKey';
            let label = document.createElement('p');
            label.innerText = note !== 'C' ? `${note}` : `${note}${octave}`;
            key.appendChild(label);
        } else {
            key.className = 'blackKey';
        }
        this.editorListeners_.push(Blockly.browserEvents.bind(key, 'click', this, keySelectedListener));
        return key;
    }

    let createDualOctave = (startingOctave) => {
        let dualOctave = document.createElement('div');
        dualOctave.setAttribute('id', `octave-${startingOctave}-${startingOctave + 1}`);
        let keyboard = document.createElement('ul');
        keyboard.className = 'keyboard';
        for (let o = startingOctave; o <= startingOctave + 1; o++) {

            keyboard.appendChild(createKey(true, 'C', o));
            keyboard.appendChild(createKey(false, 'C#', o));
            keyboard.appendChild(createKey(true, 'D', o));
            keyboard.appendChild(createKey(false, 'D#', o));
            keyboard.appendChild(createKey(true, 'E', o));
            keyboard.appendChild(createKey(true, 'F', o));
            keyboard.appendChild(createKey(false, 'F#', o));
            keyboard.appendChild(createKey(true, 'G', o));
            keyboard.appendChild(createKey(false, 'G#', o));
            keyboard.appendChild(createKey(true, 'A', o));
            keyboard.appendChild(createKey(false, 'A#', o));
            keyboard.appendChild(createKey(true, 'B', o));
        }
        dualOctave.appendChild(keyboard);
        return dualOctave;
    }

    let piano = document.createElement('div');
    piano.className = 'piano';
    let firstMiniMapOctave = createMiniMapOctave(0);
    firstMiniMapOctave.classList.add('selected');
    piano.appendChild(firstMiniMapOctave);
    piano.appendChild(createMiniMapOctave(2));
    piano.appendChild(createMiniMapOctave(4));
    piano.appendChild(createMiniMapOctave(6));

    let octaves = document.createElement('div');
    octaves.className = 'octaves';
    octaves.appendChild(createDualOctave(0));
    octaves.appendChild(createDualOctave(2));
    octaves.appendChild(createDualOctave(4));
    octaves.appendChild(createDualOctave(6));
    this.editorListeners_.push(Blockly.browserEvents.bind(octaves, 'scroll', this, onScrolledListener));
    piano.appendChild(octaves);

    this.imageElement_ = piano;
    return this.imageElement_;
};

NoteField.prototype.dropdownDispose_ = function () {
    this.editorListeners_.forEach(l => {
        Blockly.browserEvents.unbind(l);
    });
    this.editorListeners_ = [];
    this.imageElement_ = null;
};

NoteField.prototype.hide_ = function () {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
};

NoteField.prototype.valueToNote = function (value) {
    return NoteField.NOTES[Number(value)];
};

NoteField.prototype.noteToValue = function (text) {
    var normalizedText = text.trim().toUpperCase();
    var i = NoteField.NOTES.indexOf(normalizedText);
    return i > -1 ? i : undefined;
};

NoteField.prototype.getText_ = function () {
    if (this.isBeingEdited_) {
        return NoteField.superClass_.getText_.call(this);
    }
    return this.valueToNote(this.getValue()) || null;
};

NoteField.prototype.getEditorText_ = function (value) {
    return this.valueToNote(value);
};

NoteField.prototype.getValueFromEditorText_ = function (text) {
    return this.noteToValue(text);
};

NoteField.prototype.render_ = function () {
    NoteField.superClass_.render_.call(this);
    this.updateGraph_();
};

NoteField.prototype.updateGraph_ = function () {
    if (!this.imageElement_) {
        return;
    }
    // Clear all current selections
    let whiteKeys = this.imageElement_.querySelectorAll(`[class*="whiteKey"]`);
    whiteKeys.forEach(key => key.classList.remove("selected"));
    let blackKeys = this.imageElement_.querySelectorAll(`[class*="blackKey"]`);
    blackKeys.forEach(key => key.classList.remove("selected"));

    // highlight the selected key
    let id = NoteField.NOTES[this.getValue()];
    this.imageElement_.querySelector(`[id="${id}"]`).classList.add("selected");

    // scroll to the right region on the piano, if needed
    let newOctave = parseInt(id.match(/\d+/)[0]);

    let octaves = this.imageElement_.getElementsByClassName("octaves")[0];
    if (octaves) {
        switch (newOctave) {
            case 0:
            case 1:
                octaves.scrollLeft = 0;
                break;
            case 2:
            case 3:
                octaves.scrollLeft = 226;
                break;
            case 4:
            case 5:
                octaves.scrollLeft = 676;
                break;
            case 6:
            case 7:
                octaves.scrollLeft = 1126;
                break;
        }
    }

    // set scroll style to smooth after first render
    octaves.setAttribute('style', 'scroll-behavior:smooth;');

};

NoteField.prototype.doClassValidation_ = function (opt_newValue) {
    if (opt_newValue === null || opt_newValue === undefined) {
        return null;
    }
    var note = this.valueToNote(opt_newValue);
    if (note) {
        return opt_newValue;
    }
    return null;
};