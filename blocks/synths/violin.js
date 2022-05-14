export let violin = {
    init: function() {
        this.appendDummyInput()
            .appendField("Violin");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("");
    },

    transpile: function (block) {
        return ["{ wave: 'sawtooth', adsr: { attackLevel: 0.5, attackDuration: 0.5, decayLevel: 0.7, decayDuration: 0.1, sustainDuration: 0.1, releaseDuration: 1.0 } }", Blockly.JavaScript.ORDER_NONE];
    }
};