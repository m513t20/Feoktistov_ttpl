const INSTRUCTIONS: Record<number, string> = {
  0: 'MoO', 1: 'MOo', 2: 'moO', 3: 'mOo',
  4: 'moo', 5: 'MOO', 6: 'OOM', 7: 'oom',
  8: 'mOO', 9: 'Moo', 10: 'OOO', 11: 'MMM'
};

class CowCompiler{
    Commands: string[]=[];
    Loops: Map<number, number>=new Map<number, number>();
    Buffer: Array<number>= new Array<number>(30000).fill(0);;
    ptr: number = 0;
    n: number = 0;
    output: string = "";
    args: string = "";
    arg_index: number = 0;
    register: number = 0;

    constructor(input: string, args: string = "") {
        this.Commands = input.replace(/(\r\n|\n|\r)/gm, " ").split(/(\s+)/);
        this.Loops = this.getLoops();
        this.args = args;
    }

    private getLoops(): Map<number, number>{
        var stack: number[] = [];
        var loops: Map<number, number> = new Map<number,number>();
        for (var i=0; i<this.Commands.length; i++){
            if (this.Commands[i] === "MOO")
            {
                stack.push(i);
            }
            else if (this.Commands[i] === "moo")
            {
                var li: number | undefined = stack.pop();

                if (li !== undefined)
                {
                    loops.set(i,li);
                    loops.set(li,i);
                }
            }
        }
        return loops;
    }


    private executeCommand(command: string){
        switch(command){
            case 'MoO':
                this.Buffer[this.ptr]+=1
                break;
            case 'MOo':
                this.Buffer[this.ptr]-=1
                if (this.Buffer[this.ptr] < 0)
                    this.Buffer[this.ptr] = 255
                break;
            case 'moO':
                this.ptr+=1
                break;
            case 'mOo':
                this.ptr-=1
                break;
            case 'MOO':
                if (this.Buffer[this.ptr] === 0) {
                    var tmp: number | undefined = this.Loops.get(this.n);
                    if (tmp !== undefined) {
                        this.n = tmp;
                    }
                }
                break;

            case 'moo':
                if (this.Buffer[this.ptr] !== 0) {
                    var tmp: number | undefined = this.Loops.get(this.n);
                    if (tmp !== undefined) {
                        this.n = tmp;
                    }
                }
                break;

            case 'OOM':
                this.output+=String.fromCharCode(this.Buffer[this.ptr]);
                break;
            case 'oom':
                this.Buffer[this.ptr] = this.args.charCodeAt(this.arg_index);
                this.arg_index += 1;
                break;
            case 'mOO':
                // call
                if (this.Buffer[this.ptr] < 12 && this.Buffer[this.ptr] >= 0)
                    this.executeCommand(INSTRUCTIONS[this.Buffer[this.ptr]])
                break;
            case 'Moo':
                // input
                if (this.Buffer[this.ptr] !== 0 )
                    this.output+=String.fromCharCode(this.Buffer[this.ptr]);
                else
                {
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
                else 
                {
                    this.Buffer[this.ptr] = this.register;
                    this.register = 0;
                }
                // buffer
                break;
            default:
                break;
        }
    }

    interpret(): string{
        while (this.n < this.Commands.length){
            var prev_n: number = this.n;
            this.executeCommand(this.Commands[this.n]);
            if (prev_n === this.n)
                this.n+= 1;
        }
        return this.output;
    }

    get_nums(): string{
        var res: string = "";
        for(var i:number = 0; i<this.output.length; i++){
            res += this.output.charCodeAt(i).toString() + " ";
        }
        return res;
    }
};
