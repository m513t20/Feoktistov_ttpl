"use strict";
const INSTRUCTIONS = {
    0: 'MoO', 1: 'MOo', 2: 'moO', 3: 'mOo',
    4: 'moo', 5: 'MOO', 6: 'OOM', 7: 'oom',
    8: 'mOO', 9: 'Moo', 10: 'OOO', 11: 'MMM'
};
class CowCompiler {
    ;
    constructor(input, args = "") {
        this.Commands = [];
        this.Loops = new Map();
        this.Buffer = new Array(30000).fill(0);
        this.ptr = 0;
        this.n = 0;
        this.output = "";
        this.args = "";
        this.arg_index = 0;
        this.register = 0;
        this.Commands = input.replace(/(\r\n|\n|\r)/gm, " ").split(/(\s+)/);
        this.Loops = this.getLoops();
        this.args = args;
    }
    getLoops() {
        var stack = [];
        var loops = new Map();
        for (var i = 0; i < this.Commands.length; i++) {
            if (this.Commands[i] === "MOO") {
                stack.push(i);
            }
            else if (this.Commands[i] === "moo") {
                var li = stack.pop();
                if (li !== undefined) {
                    loops.set(i, li);
                    loops.set(li, i);
                }
            }
        }
        return loops;
    }
    executeCommand(command) {
        switch (command) {
            case 'MoO':
                this.Buffer[this.ptr] += 1;
                break;
            case 'MOo':
                this.Buffer[this.ptr] -= 1;
                if (this.Buffer[this.ptr] < 0)
                    this.Buffer[this.ptr] = 255;
                break;
            case 'moO':
                this.ptr += 1;
                break;
            case 'mOo':
                this.ptr -= 1;
                break;
            case 'MOO':
                if (this.Buffer[this.ptr] === 0) {
                    var tmp = this.Loops.get(this.n);
                    if (tmp !== undefined) {
                        this.n = tmp;
                    }
                }
                break;
            case 'moo':
                if (this.Buffer[this.ptr] !== 0) {
                    var tmp = this.Loops.get(this.n);
                    if (tmp !== undefined) {
                        this.n = tmp;
                    }
                }
                break;
            case 'OOM':
                this.output += String.fromCharCode(this.Buffer[this.ptr]);
                break;
            case 'oom':
                this.Buffer[this.ptr] = this.args.charCodeAt(this.arg_index);
                this.arg_index += 1;
                break;
            case 'mOO':
                // call
                if (this.Buffer[this.ptr] < 12 && this.Buffer[this.ptr] >= 0)
                    this.executeCommand(INSTRUCTIONS[this.Buffer[this.ptr]]);
                break;
            case 'Moo':
                // input
                if (this.Buffer[this.ptr] !== 0)
                    this.output += String.fromCharCode(this.Buffer[this.ptr]);
                else {
                    var value = prompt("input char");
                    console.log(value);
                    if (value !== null)
                        this.Buffer[this.ptr] += value.charCodeAt(0);
                    this.Buffer[this.ptr];
                }
                // var result: number = parseInt(prompt("input char value","2"));
                break;
            case 'OOO':
                this.Buffer[this.ptr] = 0;
                break;
            case 'MMM':
                if (this.register == 0)
                    this.register = this.Buffer[this.ptr];
                else {
                    this.Buffer[this.ptr] = this.register;
                    this.register = 0;
                }
                // buffer
                break;
            default:
                break;
        }
    }
    interpret() {
        while (this.n < this.Commands.length) {
            var prev_n = this.n;
            this.executeCommand(this.Commands[this.n]);
            if (prev_n === this.n)
                this.n += 1;
        }
        return this.output;
    }
    get_nums() {
        var res = "";
        for (var i = 0; i < this.output.length; i++) {
            res += this.output.charCodeAt(i).toString() + " ";
        }
        return res;
    }
}
;
