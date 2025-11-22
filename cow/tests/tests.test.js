"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("../src/compiler");
describe('CowCompiler - Полное покрытие', () => {
    var helloWorld = `
    MoO MoO MoO MoO MoO MoO MoO MoO MOO moO MoO MoO MoO MoO MoO moO MoO MoO MoO MoO moO MoO MoO MoO MoO moO MoO MoO MoO MoO MoO MoO MoO
    MoO MoO moO MoO MoO MoO MoO mOo mOo mOo mOo mOo MOo moo moO moO moO moO Moo moO MOO mOo MoO moO MOo moo mOo MOo MOo MOo Moo MoO MoO 
    MoO MoO MoO MoO MoO Moo Moo MoO MoO MoO Moo MMM mOo mOo mOo MoO MoO MoO MoO Moo moO Moo MOO moO moO MOo mOo mOo MOo moo moO moO MoO 
    MoO MoO MoO MoO MoO MoO MoO Moo MMM MMM Moo MoO MoO MoO Moo MMM MOo MOo MOo Moo MOo MOo MOo MOo MOo MOo MOo MOo Moo mOo MoO Moo 
  `;
    var fibbonachi = `
    MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO 
    MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO 
                                                c1v44 : ASCII code of comma
    moO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO 
    MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
                                                c2v32 : ASCII code of space
    moO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
                                                c3v11 : quantity of numbers to be calculated
    moO                                         c4v0  : zeroth Fibonacci number (will not be printed)
    moO MoO                                     c5v1  : first Fibonacci number
    mOo mOo                                     c3    : loop counter
    MOO                                         block : loop to print (i)th number and calculate next one
    moO moO OOM                                 c5    : the number to be printed
    mOo mOo mOo mOo Moo moO Moo                 c1c2  : print comma and space
                                                block : actually calculate next Fibonacci in c6
    moO moO MOO moO moO MoO mOo mOo MOo moo     c4v0  : move c4 to c6 (don't need to preserve it)
    moO MOO moO MoO mOo mOo MoO moO MOo moo     c5v0  : move c5 to c6 and c4 (need to preserve it)
    moO MOO mOo MoO moO MOo moo                 c6v0  : move c6 with sum to c5
    mOo mOo mOo MOo                             c3    : decrement loop counter
    moo 
    mOo mOo MoO MoO Moo Moo Moo                 c1    : output three dots
  `;
    // базовые команды
    describe('MoO - значение текущей ячейки увеличить на 1', () => {
        test('MoO', () => {
            const compiler = new compiler_1.CowCompiler("MoO");
            compiler.interpret();
            expect(compiler.Buffer[0]).toBe(1);
        });
    });
    describe('MOo - значение ​текущей ячейки уменьшить на 1', () => {
        test('MOo', () => {
            const compiler = new compiler_1.CowCompiler("MOo");
            compiler.interpret();
            expect(compiler.Buffer[0]).toBe(255);
        });
    });
    describe('MOo + MoO', () => {
        test('MOo + MoO', () => {
            const compiler = new compiler_1.CowCompiler("MOo MoO");
            compiler.interpret();
            expect(compiler.Buffer[0]).toBe(256);
        });
    });
    describe('moO - следующая ячейка', () => {
        test('moO', () => {
            const compiler = new compiler_1.CowCompiler("moO");
            compiler.interpret();
            expect(compiler.ptr).toBe(1);
        });
    });
    describe('mOo - предыдущая ячейка', () => {
        test('mOo', () => {
            const compiler = new compiler_1.CowCompiler("moO mOo");
            compiler.interpret();
            expect(compiler.ptr).toBe(0);
        });
    });
    describe('OOM - вывод значения текущей ячейки', () => {
        test('OOM', () => {
            const compiler = new compiler_1.CowCompiler("MoO MoO OOM");
            compiler.interpret();
            expect(compiler.output.charAt(0)).toBe(String.fromCharCode(2));
        });
    });
    describe('oom - ввод значения в текущую ячейку', () => {
        test('oom', () => {
            const compiler = new compiler_1.CowCompiler("oom", "a");
            compiler.interpret();
            expect(compiler.Buffer[0]).toBe("a".charCodeAt(0));
        });
    });
    describe('mOO - выполнить инструкцию с номером из текущей ячейки', () => {
        test('mOO', () => {
            const compiler = new compiler_1.CowCompiler("mOO");
            compiler.interpret();
            expect(compiler.Buffer[0]).toBe(1);
        });
    });
    describe('Moo - если значение в ячейке равно 0, то ввести с клавиатуры, если значение не 0, то вывести на экран', () => {
        test('Moo', () => {
            const compiler = new compiler_1.CowCompiler("MoO MoO Moo");
            compiler.interpret();
            expect(compiler.output.charAt(0)).toBe(String.fromCharCode(2));
            const compiler2 = new compiler_1.CowCompiler("Moo");
            global.prompt = jest.fn(() => '1');
            compiler2.interpret();
            expect(compiler2.Buffer[0]).toBe(49);
        });
    });
    describe('OOO - обнулить значение в ячейке', () => {
        test('OOO', () => {
            const compiler = new compiler_1.CowCompiler("MoO MoO OOO");
            compiler.interpret();
            expect(compiler.Buffer[0]).toBe(0);
        });
    });
    describe('OOO - обнулить значение в ячейке', () => {
        test('OOO', () => {
            const compiler = new compiler_1.CowCompiler("MoO MoO MMM moO MMM");
            compiler.interpret();
            expect(compiler.Buffer[1]).toBe(2);
        });
    });
    // программы
    describe('Базовые операции памяти', () => {
        test('hello world', () => {
            const compiler = new compiler_1.CowCompiler(helloWorld);
            compiler.interpret();
            expect(compiler.output).toBe("Hello, World!");
        });
    });
    describe('фибоначи', () => {
        test('фибоначи', () => {
            const compiler = new compiler_1.CowCompiler(fibbonachi);
            compiler.interpret();
            expect(compiler.get_nums()).toBe("1 44 32 1 44 32 2 44 32 3 44 32 5 44 32 8 44 32 13 44 32 21 44 32 34 44 32 55 44 32 89 44 32 144 44 32 233 44 32 377 44 32 610 44 32 987 44 32 46 46 46 ");
        });
    });
});
